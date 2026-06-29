import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

class PowModel extends SimNodeModel {

    kind = 'pow'
    CGenUID = 'pow'
    tags = ['power', 'exponent', 'math', 'operation', 'arithmetic', 'calculation', 'function']

    constructor(options = {}) {
        super({ ...options, name: 'pow' });

        // Create the ports of pow model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        const inpt2 = this.getNodeByInput(1);
        
        if (inpt1 && inpt1.solve && inpt2 && inpt2.solve) {
            const base = assertScalar(inpt1.solve(), this.getModelName());
            const exponent = assertScalar(inpt2.solve(), this.getModelName());
            return {'out': Math.pow(base, exponent)};
        }
        return {'out': 0};
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <text x="5" y="15" fontFamily="Arial" fontSize="9" fill="black">a^b</text>
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            return <div>
                <p>This block computes the power of Input 1 raised to Input 2.</p>
            </div>
        }

        useModal.configure(this, 'Power Block', <ControlEditor />, true);
    }
}

export default PowModel
