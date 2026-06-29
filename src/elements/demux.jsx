import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';
import { isVectorSignal } from '../simulation/vectorSignal';

// Splits a single vector input into N scalar outputs, mirroring Simulink's
// Demux block. Width is configurable; changing it recreates the output
// ports (same resize-from-settings pattern as SubsystemModel.syncPorts()).
// Not wired into code generation or linearize().
class DemuxModel extends SimNodeModel {

    kind = 'demux'
    CGenUID = 'demux'
    tags = ['demux', 'demultiplexer', 'vector', 'split', 'bus']
    width = 2

    constructor(options = {}) {
        super({ ...options, name: 'demux' });
        this.createPort('in', true);
        this.syncOutputPorts();
    }

    syncOutputPorts() {
        [...this.getOutPorts()].forEach((port) => this.removePort(port));
        for (let i = 1; i <= this.width; i++) {
            this.createPort(`out${i}`, false);
        }
    }

    setWidth(width) {
        this.width = Math.max(1, Math.round(width));
        this.syncOutputPorts();
        this.update();
    }

    solution() {
        const inpt = this.getNodeByInput(0);
        const value = (inpt && inpt.solve) ? inpt.solve() : [];
        if (!isVectorSignal(value)) {
            throw new Error(`"${this.getModelName()}": entrada não é um sinal vetorial (recebeu um escalar)`);
        }
        const result = {};
        for (let i = 0; i < this.width; i++) {
            result[`out${i + 1}`] = value[i] !== undefined ? value[i] : 0;
        }
        return result;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12 H6 M6 5 L20 11 M6 19 L20 13" stroke="#000000" strokeWidth={1.5} />
    </svg>

    settings = () => {
        const ControlEditor = () => {
            const [width, setWidth] = useState(this.width);

            const applyWidth = (value) => {
                const numeric = Number(value);
                setWidth(value);
                if (!isNaN(numeric) && numeric >= 1) {
                    this.setWidth(numeric);
                    this.component && this.component.forceUpdate();
                }
            }

            return <div>
                <p>Splits the input vector into separate scalar outputs (out1, out2, ...).</p>
                <InputGroup label={'Number of outputs'} value={width} setValue={applyWidth} />
            </div>
        }

        useModal.configure(this, 'Demux Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize(),
            width: this.width
        };
    }

    deserialize(event) {
        super.deserialize(event);
        // Não chama syncOutputPorts() aqui: as portas (e os links que elas
        // carregam) já foram restauradas por super.deserialize() a partir do
        // próprio JSON serializado. Recriá-las agora descartaria esses links.
        this.width = event.data.width || 2;
    }
}

export default DemuxModel
