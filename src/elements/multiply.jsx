import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';

class MultiplyModel extends SimNodeModel {

    kind = 'multiply'

    constructor(options = {}) {
        super({ ...options, name: 'multiply' });

        // Create the ports of multiply model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        let product = 1;
        for (let i = 0; i < this.getInPorts().length; i++) {
            const inpt = this.getNodeByInput(i)
            if (inpt && inpt.solve) {
                product *= inpt.solve()
            }
        }
        return product;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="7" y1="7" x2="17" y2="17" stroke="#000000" strokeWidth={1} />
        <line x1="17" y1="7" x2="7" y2="17" stroke="#000000" strokeWidth={1} />
    </svg>

    settings = _ => {
        
        // Internal editor
        const ControlEditor = () => {

            const AddPorts = () => {
                this.createPort(`in${this.getInPorts().length + 1}`, true)
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>This block multiplies the values from all input ports.<br />You can add new ports.</p>
                <button className='btn' onClick={AddPorts}>Add port</button>
            </div>
        }

        useModal.configure(this, 'Multiply Block', <ControlEditor />, true);
    }
}

export default MultiplyModel
