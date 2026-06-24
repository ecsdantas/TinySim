import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import Simulation from '../simulation/core';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class RampModel extends SimNodeModel {

    kind = 'ramp'
    CGenUID = 'ramp'
    tags = ['ramp', 'source', 'input', 'slope', 'linear', 'signal']

    constructor(options = {}, slope = 1, startTime = 0, initialOutput = 0) {
        super({ ...options, name: 'ramp' });

        this.slope = slope
        this.startTime = startTime
        this.initialOutput = initialOutput

        // Create the ports of ramp model
        this.createPort('out', false);
    }

    // Main function of the block
    solution() {
        const t = Simulation.getCurrentTime();
        if (t < this.startTime) return { 'out': this.initialOutput }
        return { 'out': this.initialOutput + this.slope * (t - this.startTime) }
    }

    icon = () => <svg width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="62" height="30" stroke="#000000" strokeWidth="1" />
        <path d="M8 24 L24 24 L58 6" stroke="#000000" strokeWidth="1.5" fill="none" />
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n))

        // Internal editor
        const ControlEditor = () => {

            const [getSlope, setSlope] = useState(this.slope)
            const [getStartTime, setStartTime] = useState(this.startTime)
            const [getInitialOutput, setInitialOutput] = useState(this.initialOutput)

            useEffect(() => {
                if (isNumber(getSlope)) {
                    this.slope = Number(getSlope)
                    this.component && this.component.forceUpdate();
                }
            }, [getSlope])

            useEffect(() => {
                if (isNumber(getStartTime)) {
                    this.startTime = Number(getStartTime)
                    this.component && this.component.forceUpdate();
                }
            }, [getStartTime])

            useEffect(() => {
                if (isNumber(getInitialOutput)) {
                    this.initialOutput = Number(getInitialOutput)
                    this.component && this.component.forceUpdate();
                }
            }, [getInitialOutput])

            return <div>
                <p>This block outputs InitialOutput until StartTime, then ramps up (or down) at the configured Slope.</p>
                <InputGroup label={'Slope'} value={getSlope} setValue={e => setSlope(e)} />
                <InputGroup label={'Start time'} value={getStartTime} setValue={e => setStartTime(e)} />
                <InputGroup label={'Initial output'} value={getInitialOutput} setValue={e => setInitialOutput(e)} />
            </div>
        }

        useModal.configure(this, 'Ramp Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            slope: this.slope,
            startTime: this.startTime,
            initialOutput: this.initialOutput
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.slope = event.data.slope ?? 1;
        this.startTime = event.data.startTime ?? 0;
        this.initialOutput = event.data.initialOutput ?? 0;
    }
}

export default RampModel
