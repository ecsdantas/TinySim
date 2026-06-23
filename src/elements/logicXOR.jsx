import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

class XorModel extends SimNodeModel {

    kind = 'XOR';
    CGenUID = 'xor';
    tags = ['logic', 'xor', 'operation', 'value', 'boolean'];

    constructor(options = {}) {
        super({ ...options, name: 'xor' });

        // Create the ports of the XOR model
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
                result ^= (input.solve() > 0);
            }
        }
        return { 'out': result? 1 : 0 };
    }

    icon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke='#000' strokeWidth={1}>
            <path d="m 4.1,4.1 c 17,0 19,8.3 19,8.3 v 0 c -2.2,9.8 -19,8.2 -19,8.2 8,-8.3 0,-16.5 0,-16.5 z" />
            <path d="m 1,20.6 c 8.4,-8.3 0,-16.4 0,-16.4" />
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
                    <p>This block performs an XOR operation on the values from all input ports.<br />You can add new ports.</p>
                    <button className='btn' onClick={AddPorts}>Add port</button>
                </div>
            );
        };

        useModal.configure(this, 'XOR Block', <ControlEditor />, true);
    }
}

export default XorModel;
