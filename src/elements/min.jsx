import React, { useState } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';

class MinModel extends SimNodeModel {

    kind = 'min'

    constructor(options = {}) {
        super({ ...options, name: 'min' });

        // Create the ports of min model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        const inpt2 = this.getNodeByInput(1);
        
        if (inpt1 && inpt1.solve && inpt2 && inpt2.solve) {
            const value1 = inpt1.solve();
            const value2 = inpt2.solve();
            return {'out': Math.min(value1, value2)};
        }
        return {'out': NaN};
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1" />
        <text x="6" y="15" fontFamily="Arial" fontSize="8" fill="#000000">min</text>
    </svg>

    settings = _ => {

        const AddPorts = () => {
            this.createPort(`in${this.getInPorts().length + 1}`, true)
            this.component && this.component.forceUpdate();
        }

        const ControlEditor = () => {
            return <div>
                <p>This block computes the minimum value from the input ports. You can add new ports.</p>
                <button className='btn' onClick={AddPorts}>Add port</button>
            </div>
        }

        useModal.configure(this, 'Min Block', <ControlEditor />, true);
    }
}

export default MinModel
