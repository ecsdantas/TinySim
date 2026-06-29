import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

class SqrtModel extends SimNodeModel {

    kind = 'sqrt'
    CGenUID = 'sqrt'
    tags = ['math', 'square root', 'function', 'calculation', 'value', 'operation']

    constructor(options = {}) {
        super({ ...options, name: 'sqrt' });

        // Create the ports of sqrt model
        this.createPort('out', false);
        this.createPort('in1', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);

        if (inpt1 && inpt1.solve) {
            const value = assertScalar(inpt1.solve(), this.getModelName());
            if (value < 0) {
                return { 'out': NaN };
            }
            return { 'out': Math.sqrt(value) };
        }
        return { 'out': NaN };
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" stroke="#000000" strokeWidth={1} />
        <text x="5" y="18" fontFamily="Verdana" fontSize="13" fill="black">√</text>
    </svg>

    settings = _ => {

        // Internal editor
        const ControlEditor = () => <div>
                <p>This block computes the square root of Input 1.</p>
            </div>

        useModal.configure(this, 'Square Root Block', <ControlEditor />, true);
    }
}

export default SqrtModel;
