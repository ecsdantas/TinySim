import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';

class SwitchModel extends SimNodeModel {

    kind = 'switch'

    constructor(options = {}) {
        super({ ...options, name: 'switch' });

        // Create the ports of switch model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
        this.createPort('in3', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        const inpt2 = this.getNodeByInput(1);
        const inpt3 = this.getNodeByInput(2);

        if (inpt2 && inpt2.solve) {
            const condition = inpt2.solve();
            if (condition) {
                if (inpt1 && inpt1.solve) {
                    return { 'out': inpt1.solve() };
                }
            } else {
                if (inpt3 && inpt3.solve) {
                    return { 'out': inpt3.solve() };
                }
            }
        }
        return { 'out': NaN }
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <line x1="17" x2="21" y1="12" y2="12" stroke="#000000" strokeWidth="1" />
        <line x1="2" x2="8" y1="8" y2="8" stroke="#000000" strokeWidth="1" />
        <line x1="2" x2="8" y1="16" y2="16" stroke="#000000" strokeWidth="1" />
        <line x1="9" x2="16" y1="8" y2="12" stroke="#000000" strokeWidth="1.5" />
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                // No additional ports needed for this model
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>This block outputs Input 1 if Input 2 is true, otherwise it outputs Input 3.</p>
            </div>
        }

        useModal.configure(this, 'Switch Block', <ControlEditor />, true);
    }
}

export default SwitchModel
