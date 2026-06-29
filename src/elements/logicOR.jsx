import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

class OrModel extends SimNodeModel {

    kind = 'OR';
    CGenUID = 'or';
    tags = ['logic', 'or', 'operation', 'value', 'boolean'];

    constructor(options = {}) {
        super({ ...options, name: 'or' });

        // Create the ports of the OR model
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
                result |= (assertScalar(input.solve(), this.getModelName()) > 0);
            }
        }
        return { 'out': result? 1 : 0 };
    }

    icon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M 2.3,4.09 C 20.26,4.09 22.3,12.34 22.3,12.34 v 0 C 20,22.1 2.3,20.53 2.3,20.53 c 8.43,-8.25 0,-16.44 0,-16.44 z" stroke="#333" />
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
                    <p>This block performs an OR operation on the values from all input ports.<br />You can add new ports.</p>
                    <button className='btn' onClick={AddPorts}>Add port</button>
                </div>
            );
        };

        useModal.configure(this, 'OR Block', <ControlEditor />, true);
    }
}

export default OrModel;
