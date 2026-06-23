import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';

// Base class for blocks that fold 2+ numeric inputs into a single output
// (Add, Sub, Multiply, Divide, Mod). It owns port creation, the "Add port"
// settings UI and the fold loop; subclasses only declare metadata and the
// combine() step.
class VariadicMathModel extends SimNodeModel {

    // Subclasses should override these:
    identity = 0                  // value returned when 0 ports are connected
    seedFromFirstInput = false    // true: accumulator starts as in1's value (sub/divide/mod)
                                   // false: accumulator starts at `identity` (add/multiply)
    modalTitle = 'Math Block'
    helpText = 'This block combines its input values.'

    constructor(options = {}, name) {
        super({ ...options, name });

        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Subclasses must override: combine(accumulator, nextValue) => newAccumulator
    combine(acc, value) {
        return acc;
    }

    // Main function of the block
    solution() {
        const ports = this.getInPorts();
        let acc = this.seedFromFirstInput ? null : this.identity;
        let started = !this.seedFromFirstInput;

        for (let i = 0; i < ports.length; i++) {
            const inpt = this.getNodeByInput(i);
            if (!(inpt && inpt.solve)) continue;
            const value = inpt.solve();
            if (!started) {
                acc = value;
                started = true;
                continue;
            }
            acc = this.combine(acc, value);
        }
        return { out: started ? acc : this.identity };
    }

    settings = _ => {

        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                this.createPort(`in${this.getInPorts().length + 1}`, true)
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>{this.helpText}</p>
                <button className='btn' onClick={AddPorts}>Add port</button>
            </div>
        }

        useModal.configure(this, this.modalTitle, <ControlEditor />, true);
    }
}

export { VariadicMathModel }
