import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';
import { assertScalar } from '../simulation/vectorSignal';

// Combines N scalar inputs into a single vector output ([in1, in2, ...]),
// mirroring Simulink's Mux block. Not wired into code generation or
// linearize() — reaching either throws the same clear "unsupported" error
// any other unsupported block already throws.
class MuxModel extends SimNodeModel {

    kind = 'mux'
    CGenUID = 'mux'
    tags = ['mux', 'multiplexer', 'vector', 'combine', 'bus']

    constructor(options = {}) {
        super({ ...options, name: 'mux' });
        this.createPort('in1', true);
        this.createPort('in2', true);
        this.syncOutputWidth();
    }

    syncOutputWidth() {
        const width = this.getInPorts().length;
        [...this.getOutPorts()].forEach((port) => this.removePort(port));
        this.createPort('out', false, { vectorWidth: width });
    }

    solution() {
        const ports = this.getInPorts();
        const out = ports.map((_, i) => {
            const inpt = this.getNodeByInput(i);
            const value = (inpt && inpt.solve) ? inpt.solve() : 0;
            return assertScalar(value, `${this.getModelName()} (entrada in${i + 1})`);
        });
        return { out };
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5 L18 11 M4 19 L18 13 M18 12 H21" stroke="#000000" strokeWidth={1.5} />
    </svg>

    settings = () => {
        const ControlEditor = () => {
            const addPort = () => {
                this.createPort(`in${this.getInPorts().length + 1}`, true);
                this.syncOutputWidth();
                this.component && this.component.forceUpdate();
            }

            return <div>
                <p>Combines all input values into a single output vector, in port order ([in1, in2, ...]).</p>
                <button className='btn' onClick={addPort}>Add port</button>
            </div>
        }

        useModal.configure(this, 'Mux Block', <ControlEditor />, true);
    }
}

export default MuxModel
