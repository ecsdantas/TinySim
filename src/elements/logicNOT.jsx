import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

class NotModel extends SimNodeModel {

    kind = 'NOT';
    CGenUID = 'not';
    tags = ['logic', 'not', 'operation', 'value', 'boolean', 'inverter', 'invert', 'inversor'];

    constructor(options = {}) {
        super({ ...options, name: 'not' });

        // Create the ports of the NOT model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        const input = this.getNodeByInput(0);
        if (input && input.solve) {
            return { 'out': (assertScalar(input.solve(), this.getModelName()) > 0)? 0 : 1 };
        }
        return { 'out': 1 }; // default output when no input
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke='#000' strokeWidth={1}>
            <path d="M 3,12 V 4 L 15,12 3,20 v -12" />
            <path d="m 22,12 a 3.5,3.5 0 1 1 -7,0 3.5,3.5 0 1 1 7,0 z" />
        </svg>
    );

    settings = _ => {

        // Internal Editor
        const ControlEditor = () => {
            return (
                <div>
                    <p>This block performs a NOT operation on the value from the input port.</p>
                </div>
            );
        };

        useModal.configure(this, 'NOT Block', <ControlEditor />, true);
    }
}

export default NotModel;
