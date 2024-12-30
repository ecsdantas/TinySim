import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';

class ModModel extends SimNodeModel {

    kind = 'mod'
    CGenUID = 'mod'
    tags = ['mod', 'modulus', 'math', 'arithmetic', 'operation', 'remainder', 'division']

    constructor(options = {}) {
        super({ ...options, name: 'mod' });

        // Create the ports of mod model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        if (this.getInPorts().length < 1) return 0;
        
        let remainder = null;
        for (let i = 0; i < this.getInPorts().length; i++) {
            const inpt = this.getNodeByInput(i);
            if (inpt && inpt.solve) {
                const value = inpt.solve();
                if (i === 0) {
                    remainder = value;
                } else {
                    if (value === 0) {
                        return NaN; // Avoid division by zero
                    }
                    remainder %= value;
                }
            }
        }
        const ret = remainder !== null ? remainder : 0;
        return {'out': ret};
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="7" y1="12" x2="17" y2="12" stroke="#000000" strokeWidth={1} />
        <circle cx="12" cy="8" r="1" fill="#000000" />
        <circle cx="12" cy="16" r="1" fill="#000000" />
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                this.createPort(`in${this.getInPorts().length + 1}`, true);
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>This block calculates the remainder of the first input value divided by all subsequent input values.<br />You can add new ports.</p>
                <button className='btn' onClick={AddPorts}>Add port</button>
            </div>
        }

        useModal.configure(this, 'Mod Block', <ControlEditor />, true);
    }
}

export default ModModel;
