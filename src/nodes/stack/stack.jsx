import { DiagramModel } from "@projectstorm/react-diagrams";
import { toast } from "react-toastify";

class Stack {
    constructor(Engine, Simulation) {
        this.Engine = Engine;
        this.Simulation = Simulation;
        this.stacks = [];
        this.maxStackSize = 10;
        this.selectedStack = -1;

        this.Engine.getModel().registerListener({
            eventDidFire: () => this.pushState(),
        });
    }

    pushState() {
        const currentState = this.Engine.getModel().serialize();
        if (this.stacks.length >= this.maxStackSize) {
            this.stacks.shift();
        }
        this.stacks = this.stacks.slice(0, this.selectedStack + 1);
        this.stacks.push(currentState);
        this.selectedStack = this.stacks.length - 1;
    }

    updateModel() {
        const modelData = this.stacks[this.selectedStack];
        const EngModel = new DiagramModel();
        EngModel.deserializeModel(modelData, this.Engine);
        this.Engine.setModel(EngModel);
        this.Simulation.setModel(EngModel);
        this.Simulation.resetSimulation();
        this.Engine.repaintCanvas();
    }

    undoLastAction() {
        if (this.selectedStack <= 0) {
            toast.warning("Nothing to Undo!", { autoClose: 3000 });
            return;
        }
        this.selectedStack -= 1;
        this.updateModel();
    }

    redoLastAction() {
        if (this.selectedStack >= this.stacks.length - 1) {
            toast.warning("Nothing to Redo!", { autoClose: 3000 });
            return;
        }
        this.selectedStack += 1;
        this.updateModel();
    }
}

export default Stack;
