import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

class SRFlipFlopModel extends SimNodeModel {

    kind = 'srFlipFlop';

    constructor(options = {}) {
        super({ ...options, name: 'srFlipFlop' });

        // Create the ports of the SR Flip-Flop model
        this.createPort('outQ', false);  // Q output
        this.createPort('outNotQ', false);  // Not Q output
        this.createPort('set', true);  // S input
        this.createPort('reset', true);  // R input
        this.q = 0;  // Initial state of Q
    }

    // Main function of the block
    solution() {
        const set = this.getNodeByInput(0) ? this.getNodeByInput(0).solve() : 0;
        const reset = this.getNodeByInput(1) ? this.getNodeByInput(1).solve() : 0;

        if (set && reset) {
            // Invalid state, typically this would be avoided in real circuits
            console.error("Invalid state: Both S and R are high.");
        } else if (set) {
            this.q = 1;
        } else if (reset) {
            this.q = 0;
        }

        return { 'outQ': this.q, 'outNotQ': !this.q };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="2" stroke="#000000" strokeWidth={1} />
            <text x="6" y="10" fontSize="8" fill="#000000">S</text>
            <text x="6" y="18" fontSize="8" fill="#000000">R</text>
            <text x="16" y="10" fontSize="8" fill="#000000">Q</text>
            <text x="16" y="18" fontSize="8" fill="#000000">Q'</text>
            <line x1="8" y1="12" x2="16" y2="12" stroke="#000000" strokeWidth={1} />
        </svg>
    );

    settings = _ => {

        // Internal Editor
        const ControlEditor = () => {
            return (
                <div>
                    <p>This block simulates an SR flip-flop, which has Set (S) and Reset (R) inputs and outputs Q and Q'.</p>
                </div>
            );
        };

        useModal.configure(this, 'SR Flip-Flop Block', <ControlEditor />, true);
    }
}

export default SRFlipFlopModel;
