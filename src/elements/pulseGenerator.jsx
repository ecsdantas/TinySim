import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import Simulation from '../simulation/core';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class PulseGeneratorModel extends SimNodeModel {

    kind = 'pulseGenerator'
    CGenUID = 'pulse'
    tags = ['pulse', 'generator', 'square', 'wave', 'source', 'input', 'periodic', 'signal', 'pwm']

    constructor(options = {}, amplitude = 1, period = 1, pulseWidth = 50, phaseDelay = 0) {
        super({ ...options, name: 'pulseGenerator' });

        this.amplitude = amplitude
        this.period = period
        this.pulseWidth = pulseWidth // percentage of period the pulse is "on"
        this.phaseDelay = phaseDelay

        // Create the ports of pulse generator model
        this.createPort('out', false);
    }

    // Main function of the block
    solution() {
        const t = Simulation.getCurrentTime();
        if (t < this.phaseDelay || this.period <= 0) return { 'out': 0 }
        const elapsed = (t - this.phaseDelay) % this.period;
        const onTime = (this.pulseWidth / 100) * this.period;
        return { 'out': elapsed < onTime ? this.amplitude : 0 }
    }

    icon = () => <svg width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="62" height="30" stroke="#000000" strokeWidth="1" />
        <path d="M6 22 L6 8 L20 8 L20 22 L34 22 L34 8 L48 8 L48 22 L60 22" stroke="#000000" strokeWidth="1.5" fill="none" />
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n))

        // Internal editor
        const ControlEditor = () => {

            const [getAmplitude, setAmplitude] = useState(this.amplitude)
            const [getPeriod, setPeriod] = useState(this.period)
            const [getPulseWidth, setPulseWidth] = useState(this.pulseWidth)
            const [getPhaseDelay, setPhaseDelay] = useState(this.phaseDelay)

            useEffect(() => {
                if (isNumber(getAmplitude)) {
                    this.amplitude = Number(getAmplitude)
                    this.component && this.component.forceUpdate();
                }
            }, [getAmplitude])

            useEffect(() => {
                if (isNumber(getPeriod)) {
                    this.period = Number(getPeriod)
                    this.component && this.component.forceUpdate();
                }
            }, [getPeriod])

            useEffect(() => {
                if (isNumber(getPulseWidth)) {
                    this.pulseWidth = Number(getPulseWidth)
                    this.component && this.component.forceUpdate();
                }
            }, [getPulseWidth])

            useEffect(() => {
                if (isNumber(getPhaseDelay)) {
                    this.phaseDelay = Number(getPhaseDelay)
                    this.component && this.component.forceUpdate();
                }
            }, [getPhaseDelay])

            return <div>
                <p>This block outputs a square pulse of Amplitude, repeating every Period, "on" for PulseWidth% of the period, starting after PhaseDelay.</p>
                <InputGroup label={'Amplitude'} value={getAmplitude} setValue={e => setAmplitude(e)} />
                <InputGroup label={'Period'} value={getPeriod} setValue={e => setPeriod(e)} />
                <InputGroup label={'Pulse width (%)'} value={getPulseWidth} setValue={e => setPulseWidth(e)} />
                <InputGroup label={'Phase delay'} value={getPhaseDelay} setValue={e => setPhaseDelay(e)} />
            </div>
        }

        useModal.configure(this, 'Pulse Generator Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            amplitude: this.amplitude,
            period: this.period,
            pulseWidth: this.pulseWidth,
            phaseDelay: this.phaseDelay
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.amplitude = event.data.amplitude ?? 1;
        this.period = event.data.period ?? 1;
        this.pulseWidth = event.data.pulseWidth ?? 50;
        this.phaseDelay = event.data.phaseDelay ?? 0;
    }
}

export default PulseGeneratorModel
