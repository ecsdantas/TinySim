import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';

class NotModel extends SimNodeModel {

    kind = 'not';

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
            return { 'out': !input.solve() };
        }
        return { 'out': 1 }; // default output when no input
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="10" stroke="#000000" strokeWidth={1} />
            <path d="M 6 12 L 14 6 L 14 18 L 6 12 Z" fill="#000000" />
            <circle cx="17" cy="12" r="2" fill="#000000" />
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
