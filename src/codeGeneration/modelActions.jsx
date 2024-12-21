import * as CModels from "./cmodels/index";

class ModelActions {
    inUseVariables = [];

    constructor(ports, requiredLibs, includeLibs, modelStep) {
        this.ports = ports;
        this.requiredLibs = requiredLibs;
        this.modelStep = modelStep;
        this.includeLibs = includeLibs;

        // Métodos ligados ao contexto da classe
        this.addPort = this.addPort.bind(this);
        this.addLib = this.addLib.bind(this);
        this.addStep = this.addStep.bind(this);
        this.getNode = this.getNode.bind(this);

        // Adiciona dinamicamente os modelos ao protótipo
        this.registerModels(CModels);
    }

    default() {
        return "error";
    }

    addPort(portName, isInput = 0, value = 0) {
        if (!this.ports.some(p => p.name === portName)) {
            this.ports.push({ name: portName, isInput, value });
        }
    }

    addLib(lib) {
        if (!this.requiredLibs.some(existingLib => existingLib.name === lib.name)) {
            this.requiredLibs.push(lib);
        }
    }

    addIncludeLib(st) {
        if (!this.includeLibs.some(lib => lib === st)){
            this.includeLibs.push(st);
        }
    }

    addStep(st) {
        this.modelStep.push(st);
    }

    getNode(node) {
        const action = this[node.constructor.name] || this.default;
        return action.call(this, node); // Certifique-se de vincular o contexto
    }

    createNewVar(v) {
        const existingVARs = new Set(this.inUseVariables);
        let i = 0;
        while (existingVARs.has(v + i)) {
            i++;
        }
        const uniqueVar = v + i;
        this.inUseVariables.push(uniqueVar);
        return uniqueVar;
    }

    registerModels(models) {
        // Adiciona dinamicamente os modelos ao protótipo
        Object.entries(models).forEach(([name, model]) => {
            this[name] = model.bind(this); // Vincula ao contexto da instância
        });
    }
}


export { ModelActions };
