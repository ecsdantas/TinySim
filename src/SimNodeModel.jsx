import React from 'react';
import createEngine, { 
    DefaultNodeModel,
    DiagramModel,
    DefaultPortModel,
    PortWidget,
    RightAngleLinkModel,
    RightAngleLinkFactory,
} from '@projectstorm/react-diagrams';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import Simulation from './simulation/core';

// Modelo de fio quadrado
class SimPortModel extends DefaultPortModel {
    createLinkModel(){
        return new RightAngleLinkModel()
    }
}

// Modelo genêrico de um componente
class SimNodeModel extends DefaultNodeModel {

    kind = 'generic'
    description = null         // Descrição do bloco
    isTerminalBlock = false    // Indica ao simulador que este bloco não é terminal
    lastStepSolved = null      // Help to avoid re-work
    icon = null                // Icone do bloco (deve ser uma React SVG _ => <svg>...</svg>)
    settings = null            // Página de configuração do bloco (deve ser uma React SVG _ => <svg>...</svg>)

    constructor(options = {}) {
        super({
            ...options,
            type: 'sim-node',
        });
    }

    // Registra o component para que possa ser possível atualizar
    registerComponent(component) {
        this.component = component;
    }

    // Creates a new port
    createPort(label, isInput = false) {
        const port = new SimPortModel({
            in: isInput,
            name: label,
        });
        this.addPort(port);
        return port;
    }

    solve() {
        // Verifica pelo modo de simulação
        if (Simulation.statelessMode){
            return this.solution()
        }
        if (this.lastStepSolved && this.lastStepSolved.step === Simulation.getStep()){
            return this.lastStepSolved.value
        }
        // Resolve e retorna com os resultados
        this.lastStepSolved = {step: Simulation.getStep(), value: this.solution()}
        return this.lastStepSolved.value
    }

    // Basic solution
    solution(){
        return 0
    }

    // Reset
    reset(){
        this.lastStepSolved = null
    }

    // Icon must be a React Component
    setIcon(Icon){
        this.icon = Icon
    }

    // Settings must be a React Component
    setSettings(Settings){
        this.settings = Settings
    }

    // Retorna SimNodeModels conectados ao bloco atual
    // Exemplo de uso: <node>.getNodeByInput(0)?.getOptions().name
    getNodeByInput(inPortIndex = 0) {
        const port = this.getInPorts()[inPortIndex];
        const links = Object.keys(port.getLinks())
        if (port && links.length > 0) {
            // Assumindo que existe apenas uma ligação por porta de entrada
            const link = Object.values(port.getLinks())[0];
            const connectedPort = link.getSourcePort() === port ? link.getTargetPort() : link.getSourcePort();
            return connectedPort.getNode();   
        }
        return null; // Nenhuma ligação encontrada
    }
}

// Renderiza o icone
class DisplayNodeWidget extends React.Component {
    componentDidMount() {
        this.props.node.registerComponent(this);
    }
    render() {
        const { node } = this.props;
        const Icon = node.icon;
        return (
            <div className='element-icon' title={node.getOptions().name}>
                {Icon && <Icon />}
            </div>
        );
    }
}

// Factory: Esta classe é básica e permante
class SimNodeFactory extends AbstractReactFactory {
    constructor() {
        super('sim-node');
    }

    generateModel() {
        return new SimNodeModel();
    }

    generateReactWidget(event) {
        const node = event.model;
        const isSelected = node.isSelected();
        const Settings = node.settings;
        return (
            <>
            <div className={`element ${isSelected? 'selected' : ''}`}>
                <div className='element-body'>
                    <div className='element-portsIn'>{node.portsIn && node.portsIn.map( inPort =>
                        <PortWidget engine={this.engine} port={inPort} key={`in-${inPort.getOptions().name}`}>
                            <div className='port-widget' title={inPort.getOptions().name} />
                        </PortWidget>
                    )}</div>
                    <DisplayNodeWidget node={node} />
                    <div className='element-portsOut'>{node.portsOut && node.portsOut.map( outPort =>
                        <PortWidget engine={this.engine} port={outPort} key={`out-${outPort.getOptions().name}`}>
                            <div className='port-widget' title={outPort.getOptions().name} />
                        </PortWidget>
                    )}</div>
                </div>
                <div className="element-label">
                    <span>{node.getOptions().name}</span>
                    {Settings && <Settings/>}
                </div>
            </div>
            </>
        );
    }
}

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();
Engine.getNodeFactories().registerFactory(new SimNodeFactory());
Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
const Model = new DiagramModel();
Engine.setModel(Model);

export { Engine, Model, SimNodeModel }
