import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

class DFlipFlopModel extends SimNodeModel {

    kind = 'dFlipFlop';

    constructor(options = {}) {
        super({ ...options, name: 'dFlipFlop' });

        // Create the ports of the D Flip-Flop model
        this.createPort('outQ', false);  // Q output
        this.createPort('outNotQ', false);  // Not Q output
        this.createPort('d', true);  // D input
        this.createPort('clk', true);  // Clock input
        this.q = 0;  // Initial state of Q
    }

    // Main function of the block
    solution() {
        const d = assertScalar(this.getNodeByInput(0) ? this.getNodeByInput(0).solve() : 0, this.getModelName());
        const clk = assertScalar(this.getNodeByInput(1) ? this.getNodeByInput(1).solve() : 0, this.getModelName());

        if (clk) {
            this.q = d;
        }

        return { 'outQ': this.q, 'outNotQ': !this.q };
    }

    icon = () => (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="2" stroke="#000000" strokeWidth={1} />
            <text x="6" y="10" fontSize="8" fill="#000000">D</text>
            <text x="6" y="18" fontSize="8" fill="#000000">CLK</text>
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
                    <p>This block simulates a D flip-flop, which captures the value of D on the clock edge and outputs Q and Q'.</p>
                </div>
            );
        };

        useModal.configure(this, 'D Flip-Flop Block', <ControlEditor />, true);
    }
}

export default DFlipFlopModel;
