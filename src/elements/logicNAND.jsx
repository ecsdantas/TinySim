import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';

class NandModel extends SimNodeModel {

    kind = 'NAND';
    CGenUID = 'nand';
    tags = ['logic', 'nand', 'operation', 'value', 'boolean'];

    constructor(options = {}) {
        super({ ...options, name: 'nand' });

        // Create the ports of the NAND model
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
                result = result && (input.solve() > 0);
            }
        }
        return { 'out': !result };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"  stroke="#000000" strokeWidth={1}>
            <path d="M16 13c0-2-2-10-10-10h-4v18h4c5 0 10-5 10-10z" />
            <circle cx="20" cy="12" r="3.5" />
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
                    <p>This block performs a NAND operation on the values from all input ports.<br />You can add new ports.</p>
                    <button className='btn' onClick={AddPorts}>Add port</button>
                </div>
            );
        };

        useModal.configure(this, 'NAND Block', <ControlEditor />, true);
    }
}

export default NandModel;
