import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

class NorModel extends SimNodeModel {

    kind = 'NOR';
    CGenUID = 'nor';
    tags = ['logic', 'nor', 'operation', 'value', 'boolean'];

    constructor(options = {}) {
        super({ ...options, name: 'nor' });

        // Create the ports of the NOR model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        let result = 0;
        for (let i = 0; i < this.getInPorts().length; i++) {
            const input = this.getNodeByInput(i);
            if (input && input.solve) {
                result |= (input.solve()>0);
            }
        }
        return { 'out': result? 0 : 1 };
    }

    icon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
            <path d="m 1.6,5.2 c 12.7,0 14.2,7.3 14.2,7.3 v 0 c -1.6,8.6 -14.2,7.2 -14.2,7.2 6,-7.3 0,-14.5 0,-14.5 z"/>
            <circle cx="18.5" cy="12.4" r="2.6" />
        </svg>
    );

    settings = _ => {

        // Internal Editor
        const ControlEditor = () => {

            const AddPorts = () => {
                this.createPort(`in${this.getInPorts().length + 1}`, true);
                this.component && this.component.forceUpdate();
            };

            return (
                <div>
                    <p>This block performs a NOR operation on the values from all input ports.<br />You can add new ports.</p>
                    <button className='btn' onClick={AddPorts}>Add port</button>
                </div>
            );
        };

        useModal.configure(this, 'NOR Block', <ControlEditor />, true);
    }
}

export default NorModel;
