import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';

class ExponentialModel extends SimNodeModel {

    kind = 'exponential'
    CGenUID = 'exp';
    tags = ['exp', 'exponetial', 'euler', 'neperian', '2.71828'];

    constructor(options = {}) {
        super({ ...options, name: 'exponential' });

        // Create the ports of exponential model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0);
        
        if (inpt && inpt.solve) {
            const value = inpt.solve();
            return {'out': Math.exp(value)};
        }
        return {'out': NaN};
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <text x="6" y="15" fontFamily="Arial" fontSize="8" fill="black">exp</text>
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                // No additional ports needed for this model
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>This block computes the exponential function of the input value (e^x).</p>
            </div>
        }

        useModal.configure(this, 'Exponential Block', <ControlEditor />, true);
    }
}

export default ExponentialModel
