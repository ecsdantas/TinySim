import { 
    DefaultNodeModel,
    DefaultPortModel,
    RightAngleLinkModel
} from '@projectstorm/react-diagrams';
import Simulation from '../../simulation/core';
import { RightAnglePortModel } from '../ports/rightAnglePortModel'

class SimNodeModel extends DefaultNodeModel {

    kind = 'generic'
    description = null         // Descrição do bloco
    isTerminalBlock = false    // Indica ao simulador que este bloco não é terminal
    lastStepSolved = null      // Help to avoid re-work
    icon = null                // Icone do bloco (deve ser uma React SVG _ => <svg>...</svg>)
    settings = null            // Página de configuração do bloco (deve ser uma React SVG _ => <svg>...</svg>)
    flip = false               // Mirror the block 180 degree

    constructor(options = {}) {
        super({...options, type: 'sim-node'});
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

    addPort(port) {
        if (this.getPorts()[port.getID()]) {
            console.warn('Tentativa de adicionar uma porta com ID duplicado:', port.getID());
            return; // Evita adicionar portas duplicadas
        }
        super.addPort(port);
    }

    // Creates a new port
    createPort(label, isInput = false) {
        const port = new RightAnglePortModel({
            in: isInput,
            name: label,
        });
        this.addPort(port);
        return port;
    }

    solve() {
        if (!this.calledPort) return
        // Verifica pelo modo de simulação
        const portLabel = this.calledPort.options.label;
        if (Simulation.statelessMode){
            const solution = this.solution()
            return solution[portLabel]
        }
        if (this.lastStepSolved && this.lastStepSolved.step === Simulation.getCurrentStep()){
            return this.lastStepSolved.value[portLabel]
        }
        // Resolve e retorna com os resultados
        this.lastStepSolved = {step: Simulation.getCurrentStep(), value: this.solution()}
        return this.lastStepSolved.value[portLabel]
    }

    // Basic solution
    solution(){
        return {'portLabel': 0}
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
            const node = connectedPort.getNode()
            node.calledPort = connectedPort // Bind the port that was called
            return node;   
        }
        return null; // Nenhuma ligação encontrada
    }

    serialize() {
        return {
            ...super.serialize(), // Serializa propriedades básicas do nó
            type: this.constructor.name, // Nome da classe como tipo
            kind: this.kind,
            description: this.description,
            isTerminalBlock: this.isTerminalBlock,
            flip: this.flip
            /* ,
            ports: Object.fromEntries(
                Object.values(this.getPorts()).map(port => [port.getID(), port.serialize()]) // Serializa as portas
            )
            */
        };
    }
    

    deserialize(event) {
        super.deserialize(event);
    }
    
    
}

export { SimNodeModel }