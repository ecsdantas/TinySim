import React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams';


// Renderiza o icone
class DisplayNodeWidget extends React.Component {
    componentDidMount() {
        this.props.node.registerComponent(this);
    }
    render() {
        const { node, engine } = this.props;
        const Icon = node.icon;
        const isSelected = node.isSelected();
        const isFlip = node.flip
        const InPorts = () => <div className='element-portsIn'>{node.portsIn && node.portsIn.map( inPort =>
            <PortWidget engine={engine} port={inPort} key={`in-${inPort.getOptions().name}`}>
                <div className='port-widget' title={inPort.getOptions().name} />
            </PortWidget>
        )}</div>
        const OutPorts = () => <div className='element-portsOut'>{node.portsOut && node.portsOut.map( outPort =>
            <PortWidget engine={engine} port={outPort} key={`out-${outPort.getOptions().name}`}>
                <div className='port-widget' title={outPort.getOptions().name} />
            </PortWidget>
        )}</div>

        const Settings = node.settings;
        return (
            <div className={`element ${isSelected? 'selected' : ''}  ${isFlip? 'flip' : ''}`}>
                <div className='element-body'>
                    { isFlip? <OutPorts /> : <InPorts /> }
                    <div className='element-icon' title={node.getOptions().name}>
                        {Icon && <Icon />}
                    </div>
                    { isFlip? <InPorts /> : <OutPorts /> }
                </div>
                <div className="element-label">
                    <span>{node.CGenUID}</span>
                    {Settings && <button onClick={ Settings } className='settings-button' title={'Block Parameters (O)'}>⚙️</button>}
                </div>
            </div>
        );
    }
}

export { DisplayNodeWidget }