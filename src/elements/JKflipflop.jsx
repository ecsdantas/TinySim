import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

class JKFlipFlopModel extends SimNodeModel {

    kind = 'jkFlipFlop';

    constructor(options = {}) {
        super({ ...options, name: 'jkFlipFlop' });

        // Create the ports of the JK Flip-Flop model
        this.createPort('outQ', false);  // Q output
        this.createPort('outNotQ', false);  // Not Q output
        this.createPort('j', true);  // J input
        this.createPort('k', true);  // K input
        this.createPort('clk', true);  // Clock input
        this.q = 0;  // Initial state of Q
    }

    // Main function of the block
    solution() {
        const j = this.getNodeByInput(0) ? this.getNodeByInput(0).solve() : 0;
        const k = this.getNodeByInput(1) ? this.getNodeByInput(1).solve() : 0;
        const clk = this.getNodeByInput(2) ? this.getNodeByInput(2).solve() : 0;

        if (clk) {
            if (j && k) {
                this.q = !this.q;
            } else if (j) {
                this.q = 1;
            } else if (k) {
                this.q = 0;
            }
        }

        return { 'outQ': this.q, 'outNotQ': !this.q };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="2" stroke="#000000" strokeWidth={1} />
            <text x="6" y="8" fontSize="8" fill="#000000">J</text>
            <text x="6" y="14" fontSize="8" fill="#000000">K</text>
            <text x="6" y="20" fontSize="8" fill="#000000">CLK</text>
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
                    <p>This block simulates a JK flip-flop, which has J and K inputs and a clock input, with outputs Q and Q'.</p>
                </div>
            );
        };

        useModal.configure(this, 'JK Flip-Flop Block', <ControlEditor />, true);
    }
}

export default JKFlipFlopModel;
