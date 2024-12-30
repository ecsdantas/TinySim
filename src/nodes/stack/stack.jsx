import { toast } from "react-toastify";

class Stack {
    constructor(Engine, Simulation) {
        this.stackKey = "stack";
        this.redoStackKey = "redoStack";
        this.maxStackSize = 10;
        this.Engine = Engine;
        this.Simulation = Simulation;
        this.pushTimeout = null; // Timer para debounce

        // Bind dos métodos para garantir o contexto
        this.pushState = this.pushState.bind(this);
        this.pushStateDebounced = this.pushStateDebounced.bind(this);
        this.undoLastAction = this.undoLastAction.bind(this);
        this.redoLastAction = this.redoLastAction.bind(this);
        // Reseta os stacks
        sessionStorage.setItem(this.stackKey, JSON.stringify([]));
        sessionStorage.setItem(this.redoStackKey, JSON.stringify([]));

        // Inicializa os stacks
        this.getStack(this.stackKey);
        this.getStack(this.redoStackKey);

        // Salva o estado inicial
        this.pushState();

        // Observa alterações no modelo para salvar o estado
        this.Engine.getModel().registerListener({
            eventDidFire: (event) => {
                // console.log(event.function)
                this.pushStateDebounced();
            },
        });
    }

    // Recupera o histórico do sessionStorage
    getStack(key) {
        const stack = sessionStorage.getItem(key);
        if (!stack) {
            sessionStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        return JSON.parse(stack);
    }

    setStack(key, stack) {
        sessionStorage.setItem(key, JSON.stringify(stack));
    }

    // Salva o estado atual no sessionStorage
    pushState() {
        const currentState = this.Engine.getModel().serialize(); // Serializa o modelo atual

        const stack = this.getStack(this.stackKey);
        stack.push(currentState);
        if (stack.length > this.maxStackSize) {
            stack.shift(); // Remove o estado mais antigo
        }
        this.setStack(this.stackKey, stack);
        this.setStack(this.redoStackKey, []); // Limpa o redo stack ao adicionar um novo estado
    }

    // Debounced push state
    pushStateDebounced() {
        clearTimeout(this.pushTimeout);
        this.pushTimeout = setTimeout(() => {
            this.pushState();
        }, 200); // Aguarda 200ms para agrupar alterações rápidas
    }

    updateModel(modelData) {
        const EngModel = this.Engine.getModel();
        EngModel.deserializeModel(modelData, this.Engine);
        this.Engine.repaintCanvas();
        this.Simulation.setModel(EngModel);
    }

    // Desfaz a última ação
    undoLastAction() {
        const stack = this.getStack(this.stackKey);
        if (stack.length === 0) {
            toast.warning("Nothing to Undo!", { autoClose: 3000 })
            return;
        }

        const redoStack = this.getStack(this.redoStackKey);
        const previousState = stack.pop();
        redoStack.push(this.Engine.getModel().serialize()); // Salva o estado atual para o redo

        this.setStack(this.stackKey, stack);
        this.setStack(this.redoStackKey, redoStack);

        this.updateModel(previousState);
    }

    // Refaz a última ação desfeita
    redoLastAction() {
        const redoStack = this.getStack(this.redoStackKey);
        if (redoStack.length === 0) {
            toast.warning("Nothing to Redo!", { autoClose: 3000 })
            return;
        }

        const stack = this.getStack(this.stackKey);
        const nextState = redoStack.pop();
        stack.push(this.Engine.getModel().serialize()); // Salva o estado atual no stack

        this.setStack(this.stackKey, stack);
        this.setStack(this.redoStackKey, redoStack);

        this.updateModel(nextState);
    }
}

export default Stack;
