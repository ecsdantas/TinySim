import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';

class IsEvenModel extends SimNodeModel {

    kind = 'isEven'
    CGenUID = 'isEven'
    tags = ['even', 'odd', 'check', 'number']

    constructor(options = {}) {
        super({ ...options, name: 'isEven' });

        // Create the ports of isEven model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0);
        const out = (inpt && inpt.solve) ? (inpt.solve() % 2 === 0 ? 1 : 0) : 0;
        return { 'out': out };
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="13" r="12" stroke="#000000" strokeWidth={1} />
        <text x="13" y="16" textAnchor="middle" fontSize="9" fill="#000000">2n</text>
    </svg>

    settings = _ => {

        // Editor interno
        const ControlEditor = () => {
            return <div>
                <p>This block outputs 1 if the input is even and 0 if the input is odd.</p>
            </div>
        }

        useModal.configure(this, 'IsEven Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize()
        };
    }

    deserialize(event) {
        super.deserialize(event);
    }
}

export default IsEvenModel
