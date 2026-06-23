import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';

class LogModel extends SimNodeModel {

    kind = 'log'
    CGenUID = 'log'
    tags = ['math', 'logarithm', 'exponential', 'function', 'calculation', 'base', 'value', 'operation']

    constructor(options = {}) {
        super({ ...options, name: 'log' });

        // Create the ports of log model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        const inpt2 = this.getNodeByInput(1);
        
        if (inpt1 && inpt1.solve && inpt2 && inpt2.solve) {
            const value = inpt1.solve();
            const base = inpt2.solve();
            if (value <= 0 || base <= 0 || base === 1) {
                return {'out':  NaN}; // Logarithm is not defined for non-positive values or base 1
            }
            return {'out': Math.log(value) / Math.log(base)}
        }
        return {'out':  NaN}
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <text x="7" y="15" fontFamily="Arial" fontSize="8" fill="black">log</text>
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                // No additional ports needed for this model
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>This block computes the logarithm of Input 1 with the base of Input 2.</p>
            </div>
        }

        useModal.configure(this, 'Logarithm Block', <ControlEditor />, true);
    }
}

export default LogModel
