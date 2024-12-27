import * as CModels from "./cmodels/index";

class ModelActions {

    ModelC__variables = [];

    constructor(cstruct) {
        this.replacements = cstruct.replacements;
        
        // Métodos ligados ao contexto da classe
        this.addPort = this.addPort.bind(this);
        this.addLibsH__declaration = this.addLibsH__declaration.bind(this);
        this.addLibsH__include = this.addLibsH__include.bind(this);
        this.addLibsH__define = this.addLibsH__define.bind(this);
        this.addLibsC__functions = this.addLibsC__functions.bind(this);
        this.addModelC__vars = this.addModelC__vars.bind(this);
        this.addModelC__init = this.addModelC__init.bind(this);
        this.addModelC__step = this.addModelC__step.bind(this);
        this.addModelC__term = this.addModelC__term.bind(this);
        this.addModelH__vars = this.addModelH__vars.bind(this);
        this.addModelH__functions = this.addModelH__functions.bind(this);
        this.addModelC__generateNewVar = this.addModelC__generateNewVar.bind(this);
        this.getNode = this.getNode.bind(this);

        // Adiciona dinamicamente os modelos ao protótipo
        this.registerModels(CModels);
    }

    default() {
        return "error";
    }

    // FUNÇÕES PRIVADAS
    #checkReplacements(placement, content) {
        return this.replacements.some(r => r.placement === placement && r.content === content);
    }

    #addReplacement(placement, content) {
        this.replacements.push({ placement: placement, content: content });
    }

    #addUniqueReplacement(placement, content) {
        if (!this.#checkReplacements(placement, content)) {
            this.#addReplacement(placement, content);
        }
    }


    // OUTRAS FUNÇÕES
    // Add uma porta ao modelo
    addPort(portName, isInput = 0, value = 0, portType = 'double') {
        this.#addUniqueReplacement('MODEL_H__DATATYPE_TEMPLATE', `${portType} ${portName};    // ${isInput ? 'Input' : 'Output'}`);
        if (isInput){
                this.#addUniqueReplacement('MAIN_C__MAIN_LOOP_SET_VARS_TEMPLATE', `model.data.${portName} = ${value};`);
                this.#addUniqueReplacement('MAIN_C__MAIN_LOOP_SET_VARS_TEMPLATE', `printf("\\tSET ${portName} = %f\\n", model.data.${portName});`);
        }else{
                this.#addUniqueReplacement('MAIN_C__MAIN_LOOP_GET_VARS_TEMPLATE',  `printf("\\tGET ${portName} = %f\\n", model.data.${portName});`);
        }
    }

    addLibsH__declaration(st) {
        this.#addUniqueReplacement('LIBS_H__DECLARATION_TEMPLATE',  st);
    }

    addLibsH__include(st) {
        this.#addUniqueReplacement('LIBS_H__INCLUDES_TEMPLATE',  st);
    }

    addLibsH__define(st) {
        this.#addUniqueReplacement('LIBS_H__DEFINES_TEMPLATE',  st);
    }

    addLibsC__functions(st) {
        this.#addUniqueReplacement('LIBS_C__FUNCTIONS_TEMPLATE',  st);
    }

    addModelC__vars(st) {
        this.#addUniqueReplacement('MODEL_C__VARS_TEMPLATE',  st);
    }

    addModelC__init(st) {
        this.#addUniqueReplacement('MODEL_C__INIT_TEMPLATE',  st);
    }

    addModelC__step(st) {
        this.#addUniqueReplacement('MODEL_C__STEP_TEMPLATE',  st);
    }

    addModelC__term(st) {
        this.#addUniqueReplacement('MODEL_C__TERM_TEMPLATE',  st);
    }

    addModelH__vars(st) {
        this.#addUniqueReplacement('MODEL_H__VARIABLES_TEMPLATE',  st);
    }

    addModelH__functions(st) {
        this.#addUniqueReplacement('MODEL_H__FUNCTIONS_TEMPLATE',  st);
    }

    addModelC__generateNewVar(v){
        let genVar = v + 0; let i = 1;
        while(this.ModelC__variables.includes(genVar)){
            genVar = v + i;
            i += 1;
        }
        this.ModelC__variables.push(genVar);
        return genVar;
    }

    // Funções mais importante do actions
    getNode(node) {
        const action = this[node.constructor.name] || this.default;
        return action.call(this, node);
    }

    registerModels(models) {
        // Adiciona dinamicamente os modelos ao protótipo
        Object.entries(models).forEach(([name, model]) => {
            this[name] = model.bind(this); // Vincula ao contexto da instância
        });
    }
}


export { ModelActions };
