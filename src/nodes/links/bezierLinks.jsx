import { DefaultLinkModel, PointModel } from '@projectstorm/react-diagrams';
import React from 'react';
import { Engine } from '../nodeModel';

class BezierLinkModel extends DefaultLinkModel {
    constructor() {
        super({ type: 'bezier' });
        this.points.forEach(point => (point.isPort = true));
        this.initialPointPositions = [];
    }

    computeCurvature(dx, dy) {
        const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
        const breakpoints = [
            { angle: 5, curvature: 0 },
            { angle: 10, curvature: 0.05 },
            { angle: 30, curvature: 0.20 },
            { angle: 45, curvature: 0.3 },
            { angle: 90, curvature: 0.8 },
            { angle: 135, curvature: 0.3 },
            { angle: 175, curvature: 0 },
        ];
        // Smallest breakpoint whose threshold still covers this angle; beyond
        // the last breakpoint (close to 180°), keep its curvature instead of
        // falling back to an unrelated default.
        const match = breakpoints.find(bp => angle <= bp.angle);
        return match ? match.curvature : breakpoints[breakpoints.length - 1].curvature;
    }

    getPath() {
        if (!this.sourcePort) return [];
        (!this.isSelected()) && this.getPoints().map(point => point.setSelected(false));

        const paths = [];
        const pathCompute = (sourcePoint, targetPoint) => {
            if (!sourcePoint || !targetPoint) return;

            const dx = targetPoint.x - sourcePoint.x;
            const dy = targetPoint.y - sourcePoint.y;
            const curvature = this.computeCurvature(dx, dy);

            const control1 = { x: sourcePoint.x + curvature * dx, y: sourcePoint.y};
            const control2 = { x: targetPoint.x - curvature * dx, y: targetPoint.y};

            (curvature !== 0)?
                paths.push(`M ${sourcePoint.x} ${sourcePoint.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${targetPoint.x} ${targetPoint.y}`) :
                paths.push(`M ${sourcePoint.x} ${sourcePoint.y} ${targetPoint.x} ${targetPoint.y}`)
        };

        const sourcePosition = this.getPortPosition(this.sourcePort);
        const targetPosition = this.targetPort ? this.getPortPosition(this.targetPort) : this.points[this.points.length - 1]?.getPosition();

        if (!sourcePosition || !targetPosition) return paths;

        const intermediatePoints = this.getIntermediatePoints();

        // Links "para trás" (feedback) sem pontos manuais ganham um contorno
        // retangular em vez de cortar reto pelo meio do bloco de origem.
        if (intermediatePoints.length === 0 && targetPosition.x < sourcePosition.x) {
            return this.getFeedbackPath(sourcePosition, targetPosition);
        }

        const points = [sourcePosition, ...intermediatePoints, targetPosition];
        for (let i = 0; i < points.length - 1; i++) {
            pathCompute(points[i], points[i + 1]);
        }

        return paths;
    }

    getFeedbackPath(sourcePoint, targetPoint) {
        const outMargin = 30;
        const exitX = sourcePoint.x + outMargin;
        const entryX = targetPoint.x - outMargin;
        const routeY = this.computeFeedbackRouteY(sourcePoint, targetPoint);

        return [
            `M ${sourcePoint.x} ${sourcePoint.y} ` +
            `L ${exitX} ${sourcePoint.y} ` +
            `L ${exitX} ${routeY} ` +
            `L ${entryX} ${routeY} ` +
            `L ${entryX} ${targetPoint.y} ` +
            `L ${targetPoint.x} ${targetPoint.y}`
        ];
    }

    // Decide se o contorno passa por cima ou por baixo dos blocos no caminho,
    // escolhendo o lado que exige o menor desvio (ou seja, o lado com mais espaço livre).
    computeFeedbackRouteY(sourcePoint, targetPoint) {
        const margin = 30;
        const xMin = Math.min(sourcePoint.x, targetPoint.x);
        const xMax = Math.max(sourcePoint.x, targetPoint.x);
        const minY = Math.min(sourcePoint.y, targetPoint.y);
        const maxY = Math.max(sourcePoint.y, targetPoint.y);

        const diagramModel = this.getParent();
        const nodes = diagramModel && typeof diagramModel.getNodes === 'function' ? diagramModel.getNodes() : [];
        const overlapping = nodes
            .map(node => node.getBoundingBox())
            .filter(box => {
                const topLeft = box.getTopLeft();
                const bottomRight = box.getBottomRight();
                return bottomRight.x >= xMin && topLeft.x <= xMax;
            });

        const topEdge = overlapping.length ? Math.min(...overlapping.map(box => box.getTopLeft().y)) : minY;
        const bottomEdge = overlapping.length ? Math.max(...overlapping.map(box => box.getBottomRight().y)) : maxY;

        const routeAboveY = topEdge - margin;
        const routeBelowY = bottomEdge + margin;
        const distAbove = minY - routeAboveY;
        const distBelow = routeBelowY - maxY;

        return distAbove <= distBelow ? routeAboveY : routeBelowY;
    }

    getPortPosition(port) {
        const position = port.getPosition();
        return {
            x: position.x + port.width / 2,
            y: position.y + port.height / 2,
        };
    }

    getIntermediatePoints() {
        // Previne erros em caso de pontos criados fora do canvas
        this.points = this.points.filter((point, index) => {
            const pos = point.getPosition();
            const isValid = point.isPort || (pos && !isNaN(pos.x) && !isNaN(pos.y) && typeof pos.x === 'number' && typeof pos.y === 'number');
            if (!isValid) {
                console.log('Excluded points:', point);
            }
            return isValid;
        });
        return this.points.filter(point => !point.isPort).map(point => point.getPosition()).filter(pos => pos && !isNaN(pos.x) && !isNaN(pos.y));
    }

    addPoint(point) {
        const dist = 30;
        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;

        const isNear = this.points.some(
            p =>
                !p.isPort &&
                Math.hypot(p.getPosition().x - point.x, p.getPosition().y - point.y) < dist
        );

        if (isNear) return;

        const newPoint = new PointModel(this);
        newPoint.setPosition(point.x, point.y);
        newPoint.isLocked = () => false;
        super.addPoint(newPoint);
        this.points = [this.points[0], ...this.points.filter(p => !p.isPort).sort((a, b) => a.getX() - b.getX()), this.points[this.points.length-1]];

    }

    handleDoubleClick = (event) => {
        this.addPoint({ x: event.clientX, y: event.clientY });
    };

    handleDragStart = () => {
        // Salva as posições iniciais dos pontos
        this.initialPointPositions = this.points.map(point => ({ ...point.getPosition() }));
    };

    handleDrag = (event, initialOffset) => {
        const dx = event.clientX - initialOffset.x;
        const dy = event.clientY - initialOffset.y;

        this.points.forEach((point, index) => {
            const initialPosition = this.initialPointPositions[index];
            point.setPosition(initialPosition.x + dx,initialPosition.y + dy);
        });
    };

    RenderPoints = () => {
        return this.isSelected() &&
            this.getPoints()
                .filter(point => !point.isPort)
                .map((point, index) => 
                    { 
                    const pos = { x: point.getX(), y: point.getY() };
                    return <circle
                        key={`point-${index}`}
                        className="point"
                        cx={pos.x}
                        cy={pos.y}
                        //data-id={point.getID()} // point.getID()
					    //data-linkid={point.getLink().getID()}
                        //onClick={() => point.setSelected(true)}
                        onPointerMove={event => point.setPosition(event.clientX, event.clientY)}
                        r={8}
                        fill={point.isSelected() ? '#b388e0' : 'rgba(225, 225, 230, 0.9)'}
                        style={{ pointerEvents: 'all' }}
                    />}
                );
    };

    RenderPaths = () => {
        return this.getPath().map((path, index) => (
            <path
            key={`link-${index}`}
            d={path || 'M 0 0 L 1 1'}
            stroke={this.isSelected() ? '#b388e0' : 'rgba(0, 0, 0, 0.8)'}
            strokeWidth="4"
            fill="none"
            strokeDasharray={this.isSelected() ? '20,5' : '0'}
            style={{
                pointerEvents: 'all',
                animation: `${this.isSelected() ? 'dashAnimation 5s linear infinite' : 'none'}`
            }}
            onDoubleClick={this.handleDoubleClick}
            onPointerDown={event => {
                if (!event.shiftKey) {
                    this.getParent()?.getNodes().forEach(node => node.setSelected(false));
                    this.getParent()?.getLinks().forEach(link => link.setSelected(link === this));
                } else {
                    this.setSelected(true);
                }
                Engine.repaintCanvas();

                const initialOffset = { x: event.clientX, y: event.clientY };
                this.handleDragStart();
                const moveHandler = moveEvent => this.handleDrag(moveEvent, initialOffset);
                const upHandler = () => {
                window.removeEventListener('pointermove', moveHandler);
                window.removeEventListener('pointerup', upHandler);
                };
                window.addEventListener('pointermove', moveHandler);
                window.addEventListener('pointerup', upHandler);
            }}
            />
        ));
    };
}

export { BezierLinkModel };
