import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';

class AndModel extends SimNodeModel {

    kind = 'and';

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
                result = result && input.solve();
            }
        }
        return { 'out': result };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="10" stroke="#000000" strokeWidth={1} />
            <path d="M 6 12 L 12 6 L 12 18 L 6 12 Z" fill="#000000" />
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
