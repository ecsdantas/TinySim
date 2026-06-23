import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

class AndModel extends SimNodeModel {

    kind = 'AND';
    CGenUID = 'and';
    tags = ['logic', 'and', 'operation', 'value', 'boolean'];

    constructor(options = {}) {
        super({ ...options, name: 'and' });

        // Create the ports of the AND model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        let result = 1;
        for (let i = 0; i < this.getInPorts().length; i++) {
            const input = this.getNodeByInput(i);
            if (input && input.solve) {
                result &= (input.solve() > 0);
            }
        }
        return { 'out': result? 1 : 0 };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 15c0-5.523-4.477-10-10-10h-8v18h8c5.523 0 10-4.477 10-10z" stroke="#000000" strokeWidth={1} fill="none" />
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
                    <p>This block performs an AND operation on the values from all input ports.<br />You can add new ports.</p>
                    <button className='btn' onClick={AddPorts}>Add port</button>
                </div>
            );
        };

        useModal.configure(this, 'AND Block', <ControlEditor />, true);
    }
}

export default AndModel;
