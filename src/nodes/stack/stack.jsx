import { toast } from "react-toastify";
import { Engine } from "../engine";
import Simulation from "../../simulation/core";

// Tempo de espera após o último 'positionChanged' antes de gravar um estado
// no stack: evita empilhar um estado por frame durante um arrasto de bloco,
// gravando só a posição final.
const POSITION_DEBOUNCE_MS = 400;

class Stack {
    constructor(engine, simulation) {
        this.engine = engine;
        this.simulation = simulation;
        this.stacks = [];
        this.maxStackSize = 20;
        this.selectedStack = -1;
        this.suppressCapture = false;
        this.positionDebounceTimer = null;

        // Eventos disparados diretamente no DiagramModel: adicionar/remover
        // nó ou link. Posição é tratada por nó (ver attachNodeListener),
        // já que 'positionChanged' dispara no próprio nó, não no model.
        this.engine.getModel().registerListener({
            eventDidFire: (event) => this.handleModelEvent(event),
        });
        this.attachNodeListeners(this.engine.getModel());

        // Estado inicial, para permitir desfazer até o diagrama vazio
        this.pushState();
    }

    handleModelEvent(event) {
        if (event.function !== "nodesUpdated" && event.function !== "linksUpdated") {
            return;
        }
        if (event.function === "nodesUpdated" && event.isCreated && event.node) {
            this.attachNodeListener(event.node);
        }
        this.scheduleCapture();
    }

    attachNodeListeners(model) {
        model.getNodes().forEach((node) => this.attachNodeListener(node));
    }

    attachNodeListener(node) {
        node.registerListener({
            eventDidFire: (event) => {
                if (event.function === "positionChanged") {
                    this.scheduleCapture();
                }
            },
        });
    }

    scheduleCapture() {
        if (this.suppressCapture) return;
        clearTimeout(this.positionDebounceTimer);
        this.positionDebounceTimer = setTimeout(() => this.pushState(), POSITION_DEBOUNCE_MS);
    }

    pushState() {
        if (this.suppressCapture) return;

        const currentState = this.engine.getModel().serialize();
        if (this.stacks.length >= this.maxStackSize) {
            this.stacks.shift();
            this.selectedStack -= 1;
        }
        this.stacks = this.stacks.slice(0, this.selectedStack + 1);
        this.stacks.push(currentState);
        this.selectedStack = this.stacks.length - 1;
    }

    // Restaura o estado em `this.selectedStack` desserializando no MESMO
    // model (mesmo padrão usado por samples.jsx/menubar.jsx), em vez de
    // trocar o model do Engine: assim o listener registrado no construtor
    // continua válido. Os nós, porém, são recriados pela desserialização,
    // então os listeners de posição precisam ser reanexados.
    restoreState() {
        clearTimeout(this.positionDebounceTimer);
        this.suppressCapture = true;

        const modelData = this.stacks[this.selectedStack];
        const model = this.engine.getModel();
        model.clearSelection();
        model.deserializeModel(modelData, this.engine);
        this.attachNodeListeners(model);

        this.simulation.setModel(model);
        this.simulation.resetSimulation();
        this.engine.repaintCanvas();

        this.suppressCapture = false;
    }

    undoLastAction() {
        clearTimeout(this.positionDebounceTimer);
        if (this.selectedStack <= 0) {
            toast.warning("Nothing to Undo!", { autoClose: 3000 });
            return;
        }
        this.selectedStack -= 1;
        this.restoreState();
    }

    redoLastAction() {
        clearTimeout(this.positionDebounceTimer);
        if (this.selectedStack >= this.stacks.length - 1) {
            toast.warning("Nothing to Redo!", { autoClose: 3000 });
            return;
        }
        this.selectedStack += 1;
        this.restoreState();
    }
}

// Instanciado sob demanda (não no carregamento do módulo): `Engine` só tem
// um model depois que `nodeModel.jsx` chama `Engine.setModel(...)`, o que
// não acontece quando um bloco é importado isoladamente (ex.: testes via
// elements/*.test.jsx), causando `Engine.getModel()` retornar null.
let stackManager = null;

function getStackManager() {
    if (!stackManager) {
        stackManager = new Stack(Engine, Simulation);
    }
    return stackManager;
}

export { Stack };
export default getStackManager;
