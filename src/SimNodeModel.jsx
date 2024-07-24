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
import { useModal } from './components/modal';

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
    flip = false               // Mirror the block 180 degree

    constructor(options = {}) {
        super({
            ...options,
            type: 'sim-node',
        });
    }

    update(){
        this.component && this.component.forceUpdate()
    }

    getModelName(){
        return this.constructor.name;
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
        if (this.lastStepSolved && this.lastStepSolved.step === Simulation.getCurrentStep()){
            return this.lastStepSolved.value
        }
        // Resolve e retorna com os resultados
        this.lastStepSolved = {step: Simulation.getCurrentStep(), value: this.solution()}
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
            // console.dir(connectedPort); Retorna a porta de saida ao qual a solução está conectada
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
                    <span>{node.kind}</span>
                    {Settings && <button onClick={ Settings } className='settings-button' title={'Block Parameters (O)'}>⚙️</button>}
                </div>
            </div>
        );
    }
}

// Factory: Esta classe é básica e permante
class SimNodeFactory extends AbstractReactFactory {
    constructor() {
        super('sim-node');
        
        // Add evento para monitorar os blocos
        window.addEventListener('keydown', event => this.handleKeyDown(event));
    }

    // Aqui inveter os nós selecionados
    handleKeyDown(event) {
        if (useModal.getShow)
            return
        const selectedEntities = this.engine.getModel().getSelectedEntities();
        switch(event.key){
            case 'i':
                selectedEntities.forEach((entity) => {
                    if ( typeof entity.flip === "boolean" ) {
                        entity.flip = !entity.flip
                        entity.update()
                    }
                })
                break
            case 'o':
                Array.isArray(selectedEntities) && 
                selectedEntities.filter(node => node.settings).map(node => node.settings())

        }
    }

    generateModel() {
        return new SimNodeModel();
    }

    generateReactWidget(event) {
        return <DisplayNodeWidget node={ event.model } engine={ this.engine } />
    }
}

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();
Engine.getNodeFactories().registerFactory(new SimNodeFactory());
Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
const Model = new DiagramModel();

Engine.setModel(Model);

export { Engine, Model, SimNodeModel }
