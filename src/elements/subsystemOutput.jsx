import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import { LinearizationError } from '../simulation/transferFunctionMath';

// Marks where a signal leaves a Subsystem towards the outside world. Lives
// inside a SubsystemModel's internal diagram; the Subsystem itself reads
// straight from this block's input (see SubsystemModel.solution() in
// subsystem.jsx) rather than calling solve()/linearize() on it directly.
class SubsystemOutputModel extends SimNodeModel {
    kind = 'subsystemOutput';
    CGenUID = 'subout';
    tags = ['subsystem', 'output', 'out port', 'interface', 'hierarchy'];

    portIndex = 0;

    constructor(options = {}) {
        super({ ...options, name: 'subsystemOutput' });
        this.createPort('in', true);
    }

    solution() {
        const inpt = this.getNodeByInput(0);
        return { out: (inpt && inpt.solve) ? inpt.solve() : 0 };
    }

    linearize() {
        const inpt = this.getNodeByInput(0);
        if (!inpt) throw new LinearizationError(`"${this.getModelName()}": entrada não conectada`, this);
        return inpt.linearize();
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="12" height="8" stroke="#000000" strokeWidth="1" />
        <path d="M3 12 H10 M7 9 L10 12 L7 15" stroke="#000000" strokeWidth="1" fill="none" />
    </svg>

    settings = () => {
        const ControlEditor = () => (
            <p>This block represents one output of the enclosing Subsystem. Wire it to the rest of the internal diagram, then use "Sync Ports" on the Subsystem block (outside) to create the matching external port.</p>
        );
        useModal.configure(this, 'Subsystem Output', <ControlEditor />, true);
    };

    serialize() {
        return { ...super.serialize(), portIndex: this.portIndex };
    }

    deserialize(event) {
        super.deserialize(event);
        this.portIndex = event.data.portIndex || 0;
    }
}

export default SubsystemOutputModel;
