import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';

class AddModel extends SimNodeModel {

    kind = 'add'
    CGenUID = 'add'

    constructor(options = {}) {
        super({...options, name: 'add'});

        // Create the ports of add model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Função principal do bloco
    solution() { 
        let sum = 0;
        for (let i = 0; i < this.getInPorts().length; i++) {
            const inpt = this.getNodeByInput(i)
            if (inpt && inpt.solve) {
                sum += inpt.solve()
            }
        }
        return {'out': sum}
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="12" y1="6" x2="12" y2="18" stroke="#000000" strokeWidth={1} />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#000000" strokeWidth={1} />
    </svg>

    settings = _ => {
        
        // Editor interno
        const ControlEditor = () => {

            const AddPorts = () => {
                this.createPort(`in${this.getInPorts().length+1}`, true)
                this.component && this.component.forceUpdate();
            }
            return <div>
                <p>This blocks sum the values from all input ports.<br />You can add new ports.</p>
                <button className='btn' onClick={ AddPorts }>Add port</button></div>
        }

        useModal.configure(this, 'Add Block', <ControlEditor />, true);
    }
}

export default AddModel