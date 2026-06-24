import React, { useState } from 'react';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { Engine } from '../nodes/engine';
import { useModal } from '../components/modal';
import { enterSubsystem } from '../nodes/subsystemNavigation';
import { LinearizationError } from '../simulation/transferFunctionMath';

// A block that encapsulates its own internal diagram (`internalModel`),
// with SubsystemInputModel/SubsystemOutputModel markers (see
// subsystemInput.jsx/subsystemOutput.jsx) standing in for this block's own
// ports inside that diagram. "View Inside" swaps the canvas to it in place
// (see nodes/subsystemNavigation.jsx); "Sync Ports" recomputes this block's
// external ports from whatever markers currently exist inside.
//
// Not wired into code generation: a Subsystem (or its markers) reaching
// `codeGeneration/modelActions.jsx` throws a clear "no C model registered"
// error instead of generating C, same as any other unsupported block.
class SubsystemModel extends SimNodeModel {
    kind = 'subsystem';
    CGenUID = 'sub';
    tags = ['subsystem', 'nested', 'hierarchy', 'group', 'block diagram', 'composite'];

    internalModel = new DiagramModel();

    constructor(options = {}) {
        super({ ...options, name: 'subsystem' });
    }

    // --- Bridges used by SubsystemInputModel/SubsystemOutputModel ---

    // Reads this Subsystem's own external input `index`, as seen from a
    // SubsystemInputModel marker inside `internalModel`.
    getOuterInputValue(index) {
        const inputNode = this.getNodeByInput(index);
        return (inputNode && inputNode.solve) ? inputNode.solve() : 0;
    }

    getOuterInputLinearization(index) {
        const inputNode = this.getNodeByInput(index);
        if (!inputNode) throw new LinearizationError(`"${this.getModelName()}": entrada ${index + 1} não conectada`, this);
        return inputNode.linearize();
    }

    getInputMarkers() {
        return this.internalModel.getNodes()
            .filter((node) => node.kind === 'subsystemInput')
            .sort((a, b) => a.portIndex - b.portIndex);
    }

    getOutputMarkers() {
        return this.internalModel.getNodes()
            .filter((node) => node.kind === 'subsystemOutput')
            .sort((a, b) => a.portIndex - b.portIndex);
    }

    // Recomputes this block's external ports from the Input/Output markers
    // currently placed inside `internalModel`. Run manually (not on every
    // edit) to avoid wiring listeners into the internal diagram for v1.
    syncPorts() {
        const inputs = this.getInputMarkers();
        const outputs = this.getOutputMarkers();

        // Copies first: removePort splices DefaultNodeModel's own portsIn/portsOut
        // arrays in place, which would skip entries if we iterated them directly.
        [...this.getInPorts()].forEach((port) => this.removePort(port));
        [...this.getOutPorts()].forEach((port) => this.removePort(port));

        inputs.forEach((node, i) => {
            node.portIndex = i;
            node.parentSubsystem = this;
            this.createPort(`in${i + 1}`, true);
        });
        outputs.forEach((node, i) => {
            node.portIndex = i;
            node.parentSubsystem = this;
            this.createPort(`out${i + 1}`, false);
        });

        this.update();
    }

    // Computes every output at once (not just `this.calledPort`'s), so the
    // base `solve()` per-step cache (keyed by a single `solution()` call)
    // stays correct when more than one output port of this Subsystem is
    // queried within the same step.
    solution() {
        const result = {};
        this.getOutputMarkers().forEach((outputMarker, i) => {
            const inpt = outputMarker.getNodeByInput(0);
            result[`out${i + 1}`] = (inpt && inpt.solve) ? inpt.solve() : 0;
        });
        return result;
    }

    linearize() {
        const portLabel = this.calledPort?.options.label;
        const index = portLabel ? Number(portLabel.replace('out', '')) - 1 : 0;
        const outputMarker = this.getOutputMarkers()[index];
        if (!outputMarker) throw new LinearizationError(`"${this.getModelName()}": saída ${index + 1} não existe (rode "Sync Ports")`, this);
        const inpt = outputMarker.getNodeByInput(0);
        if (!inpt) throw new LinearizationError(`"${this.getModelName()}": saída ${index + 1} desconectada internamente`, this);
        return inpt.linearize();
    }

    reset() {
        super.reset();
        this.internalModel.getNodes().forEach((node) => node.reset && node.reset());
    }

    viewInside = () => enterSubsystem(this);

    icon = () => <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="36" height="28" stroke="#000000" strokeWidth="1" />
        <rect x="8" y="8" width="8" height="6" stroke="#000000" strokeWidth="1" />
        <rect x="24" y="18" width="8" height="6" stroke="#000000" strokeWidth="1" />
        <path d="M16 11 H24 V21" stroke="#000000" strokeWidth="1" fill="none" />
    </svg>

    settings = () => {
        const ControlEditor = () => {
            const [, forceUpdate] = useState(0);

            const handleSync = () => {
                this.syncPorts();
                forceUpdate((n) => n + 1);
            };

            return (
                <div>
                    <p>A Subsystem encapsulates its own internal diagram. Click "View Inside" to edit it; place Subsystem Input/Output blocks inside to define its ports, then "Sync Ports" to bring them outside.</p>
                    <p>{this.getInputMarkers().length} input(s), {this.getOutputMarkers().length} output(s)</p>
                    <button className="btn" onClick={this.viewInside} style={{ marginRight: '10px' }}>View Inside</button>
                    <button className="btn" onClick={handleSync}>Sync Ports</button>
                </div>
            );
        };

        useModal.configure(this, 'Subsystem Block', <ControlEditor />, true);
    };

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            internalModel: this.internalModel.serialize(),
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.internalModel = new DiagramModel();
        if (event.data.internalModel) {
            this.internalModel.deserializeModel(event.data.internalModel, Engine);
        }
        this.syncPorts();
    }
}

export default SubsystemModel;
