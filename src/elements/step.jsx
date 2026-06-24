import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import Simulation from '../simulation/core';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class StepModel extends SimNodeModel {

    kind = 'step'
    CGenUID = 'step'
    tags = ['step', 'source', 'input', 'edge', 'transition', 'signal']

    constructor(options = {}, stepTime = 1, initialValue = 0, finalValue = 1) {
        super({ ...options, name: 'step' });

        this.stepTime = stepTime
        this.initialValue = initialValue
        this.finalValue = finalValue

        // Create the ports of step model
        this.createPort('out', false);
    }

    // Main function of the block
    solution() {
        const t = Simulation.getCurrentTime();
        return { 'out': t < this.stepTime ? this.initialValue : this.finalValue }
    }

    icon = () => <svg width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="62" height="30" stroke="#000000" strokeWidth="1" />
        <path d="M8 22 L32 22 L32 8 L58 8" stroke="#000000" strokeWidth="1.5" fill="none" />
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n))

        // Internal editor
        const ControlEditor = () => {

            const [getStepTime, setStepTime] = useState(this.stepTime)
            const [getInitialValue, setInitialValue] = useState(this.initialValue)
            const [getFinalValue, setFinalValue] = useState(this.finalValue)

            useEffect(() => {
                if (isNumber(getStepTime)) {
                    this.stepTime = Number(getStepTime)
                    this.component && this.component.forceUpdate();
                }
            }, [getStepTime])

            useEffect(() => {
                if (isNumber(getInitialValue)) {
                    this.initialValue = Number(getInitialValue)
                    this.component && this.component.forceUpdate();
                }
            }, [getInitialValue])

            useEffect(() => {
                if (isNumber(getFinalValue)) {
                    this.finalValue = Number(getFinalValue)
                    this.component && this.component.forceUpdate();
                }
            }, [getFinalValue])

            return <div>
                <p>This block outputs InitialValue until StepTime, then switches to FinalValue.</p>
                <InputGroup label={'Step time'} value={getStepTime} setValue={e => setStepTime(e)} />
                <InputGroup label={'Initial value'} value={getInitialValue} setValue={e => setInitialValue(e)} />
                <InputGroup label={'Final value'} value={getFinalValue} setValue={e => setFinalValue(e)} />
            </div>
        }

        useModal.configure(this, 'Step Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            stepTime: this.stepTime,
            initialValue: this.initialValue,
            finalValue: this.finalValue
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.stepTime = event.data.stepTime ?? 1;
        this.initialValue = event.data.initialValue ?? 0;
        this.finalValue = event.data.finalValue ?? 1;
    }
}

export default StepModel
