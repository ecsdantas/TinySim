import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';

// Marks where a signal enters a Subsystem from the outside world. Lives
// inside a SubsystemModel's internal diagram; `SubsystemModel.syncPorts()`
// (see subsystem.jsx) binds `parentSubsystem`/`portIndex` on it so it knows
// which of the Subsystem's own input ports to read from.
class SubsystemInputModel extends SimNodeModel {
    kind = 'subsystemInput';
    CGenUID = 'subin';
    tags = ['subsystem', 'input', 'in port', 'interface', 'hierarchy'];

    parentSubsystem = null;
    portIndex = 0;

    constructor(options = {}) {
        super({ ...options, name: 'subsystemInput' });
        this.createPort('out', false);
    }

    solution() {
        const value = this.parentSubsystem ? this.parentSubsystem.getOuterInputValue(this.portIndex) : 0;
        return { out: value };
    }

    linearize() {
        if (!this.parentSubsystem) return super.linearize();
        return this.parentSubsystem.getOuterInputLinearization(this.portIndex);
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="8" width="12" height="8" stroke="#000000" strokeWidth="1" />
        <path d="M14 12 H21 M18 9 L21 12 L18 15" stroke="#000000" strokeWidth="1" fill="none" />
    </svg>

    settings = () => {
        const ControlEditor = () => (
            <p>This block represents one input of the enclosing Subsystem. Wire it to the rest of the internal diagram, then use "Sync Ports" on the Subsystem block (outside) to create the matching external port.</p>
        );
        useModal.configure(this, 'Subsystem Input', <ControlEditor />, true);
    };

    serialize() {
        return { ...super.serialize(), portIndex: this.portIndex };
    }

    deserialize(event) {
        super.deserialize(event);
        this.portIndex = event.data.portIndex || 0;
    }
}

export default SubsystemInputModel;
