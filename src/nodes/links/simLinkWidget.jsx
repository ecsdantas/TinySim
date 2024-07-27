import * as React from "react";
import { LinkWidget, PointModel } from "@projectstorm/react-diagrams-core";
import { DefaultLinkSegmentWidget } from "@projectstorm/react-diagrams-defaults";
import { Point } from "@projectstorm/geometry";

export class SimLinkWidget extends React.Component {
  static defaultProps = {
    color: "red",
    width: 2,
    link: null,
    smooth: true,
    diagramEngine: null,
    factory: null
  };

  constructor(props) {
    super(props);

    this.refPaths = [];
    this.state = {
      selected: false,
      canDrag: false
    };

    this.dragging_index = 0;
  }

  componentDidUpdate() {
    this.props.link.setRenderedPaths(
      this.refPaths.map(ref => ref.current)
    );
  }

  componentDidMount() {
    this.props.link.setRenderedPaths(
      this.refPaths.map(ref => ref.current)
    );
  }

  componentWillUnmount() {
    this.props.link.setRenderedPaths([]);
  }

  generateLink(path, extraProps, id) {
    const ref = React.createRef();
    this.refPaths.push(ref);
    return (
      <DefaultLinkSegmentWidget
        key={`link-${id}`}
        path={path}
        selected={this.state.selected}
        diagramEngine={this.props.diagramEngine}
        factory={this.props.diagramEngine.getFactoryForLink(this.props.link)}
        link={this.props.link}
        forwardRef={ref}
        onSelection={selected => {
          this.setState({ selected });
        }}
        extras={extraProps}
      />
    );
  }

  calculatePositions(points, event, index, coordinate) {
    if (index === 0) {
      let point = new PointModel({
        link: this.props.link,
        position: new Point(points[index].getX(), points[index].getY())
      });
      this.props.link.addPoint(point, index);
      this.dragging_index++;
      return;
    } else if (index === points.length - 2) {
      let point = new PointModel({
        link: this.props.link,
        position: new Point(points[index + 1].getX(), points[index + 1].getY())
      });
      this.props.link.addPoint(point, index + 1);
      return;
    }

    if (index - 2 > 0) {
      let _points = {
        [index - 2]: points[index - 2].getPosition(),
        [index + 1]: points[index + 1].getPosition(),
        [index - 1]: points[index - 1].getPosition()
      };
      if (
        Math.abs(
          _points[index - 1][coordinate] - _points[index + 1][coordinate]
        ) < 5
      ) {
        _points[index - 2][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
        _points[index + 1][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
        points[index - 2].setPosition(_points[index - 2]);
        points[index + 1].setPosition(_points[index + 1]);
        points[index - 1].remove();
        points[index - 1].remove();
        this.dragging_index--;
        this.dragging_index--;
        return;
      }
    }

    if (index + 2 < points.length - 2) {
      let _points = {
        [index + 3]: points[index + 3].getPosition(),
        [index + 2]: points[index + 2].getPosition(),
        [index + 1]: points[index + 1].getPosition(),
        [index]: points[index].getPosition()
      };
      if (
        Math.abs(
          _points[index + 1][coordinate] - _points[index + 2][coordinate]
        ) < 5
      ) {
        _points[index][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
        _points[index + 3][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
        points[index].setPosition(_points[index]);
        points[index + 3].setPosition(_points[index + 3]);
        points[index + 1].remove();
        points[index + 1].remove();
        return;
      }
    }

    let _points = {
      [index]: points[index].getPosition(),
      [index + 1]: points[index + 1].getPosition()
    };
    _points[index][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
    _points[index + 1][coordinate] = this.props.diagramEngine.getRelativeMousePoint(event)[coordinate];
    points[index].setPosition(_points[index]);
    points[index + 1].setPosition(_points[index + 1]);
  }

  draggingEvent(event, index) {
    let points = this.props.link.getPoints();
    let dx = Math.abs(points[index].getX() - points[index + 1].getX());
    let dy = Math.abs(points[index].getY() - points[index + 1].getY());

    if (dx === 0) {
      this.calculatePositions(points, event, index, "x");
    } else if (dy === 0) {
      this.calculatePositions(points, event, index, "y");
    }
    this.props.link.setFirstAndLastPathsDirection();
  }

  handleMove = event => {
    this.draggingEvent(event, this.dragging_index);
  };

  handleUp = event => {
    this.setState({ canDrag: false, selected: false });
    window.removeEventListener("mousemove", this.handleMove);
    window.removeEventListener("mouseup", this.handleUp);
  };

  render() {
    let points = this.props.link.getPoints();
    let paths = [];

    let pointLeft = points[0];
    let pointRight = points[points.length - 1];
    let hadToSwitch = false;
    if (pointLeft.getX() > pointRight.getX()) {
      pointLeft = points[points.length - 1];
      pointRight = points[0];
      hadToSwitch = true;
    }
    let dy = Math.abs(points[0].getY() - points[points.length - 1].getY());

    if (this.props.link.getTargetPort() === null && points.length === 2) {
      [...Array(2)].forEach(() => {
        this.props.link.addPoint(
          new PointModel({
            link: this.props.link,
            position: new Point(pointLeft.getX(), pointRight.getY())
          }),
          1
        );
      });
      this.props.link.setManuallyFirstAndLastPathsDirection(true, true);
    } else if (
      this.props.link.getTargetPort() === null &&
      this.props.link.getSourcePort() !== null
    ) {
      points[1].setPosition(
        pointRight.getX() + (pointLeft.getX() - pointRight.getX()) / 2,
        !hadToSwitch ? pointLeft.getY() : pointRight.getY()
      );
      points[2].setPosition(
        pointRight.getX() + (pointLeft.getX() - pointRight.getX()) / 2,
        !hadToSwitch ? pointRight.getY() : pointLeft.getY()
      );
    } else if (!this.state.canDrag && points.length > 2) {
      for (let i = 1; i < points.length; i += points.length - 2) {
        if (i - 1 === 0) {
          if (this.props.link.getFirstPathXdirection()) {
            points[i].setPosition(points[i].getX(), points[i - 1].getY());
          } else {
            points[i].setPosition(points[i - 1].getX(), points[i].getY());
          }
        } else {
          if (this.props.link.getLastPathXdirection()) {
            points[i - 1].setPosition(points[i - 1].getX(), points[i].getY());
          } else {
            points[i - 1].setPosition(points[i].getX(), points[i - 1].getY());
          }
        }
      }
    }

    if (points.length === 2 && dy !== 0 && !this.state.canDrag) {
      this.props.link.addPoint(
        new PointModel({
          link: this.props.link,
          position: new Point(pointLeft.getX(), pointRight.getY())
        })
      );
    }

    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            "data-linkid": this.props.link.getID(),
            "data-point": j,
            onMouseDown: event => {
              if (event.button === 0) {
                this.setState({ canDrag: true });
                this.dragging_index = j;
                window.addEventListener("mousemove", this.handleMove);
                window.addEventListener("mouseup", this.handleUp);
              }
            },
            onMouseEnter: () => {
              this.setState({ selected: true });
              this.props.link.lastHoverIndexOfPath = j;
            }
          },
          j
        )
      );
    }

    this.refPaths = [];
    return (
      <g data-default-link-test={this.props.link.getOptions().testName}>
        {paths}
      </g>
    );
  }
}
