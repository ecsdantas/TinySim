import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import Simulation from '../simulation/core';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class SineWaveModel extends SimNodeModel {

    kind = 'sineWave'
    CGenUID = 'sine'
    tags = ['sine', 'wave', 'sin', 'source', 'input', 'oscillator', 'periodic', 'signal']

    constructor(options = {}, amplitude = 1, frequency = 1, phase = 0, bias = 0) {
        super({ ...options, name: 'sineWave' });

        this.amplitude = amplitude
        this.frequency = frequency
        this.phase = phase
        this.bias = bias

        // Create the ports of sine wave model
        this.createPort('out', false);
    }

    // Main function of the block
    solution() {
        const t = Simulation.getCurrentTime();
        return { 'out': this.amplitude * Math.sin(this.frequency * t + this.phase) + this.bias }
    }

    icon = () => <svg width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="62" height="30" stroke="#000000" strokeWidth="1" />
        <path d="M6 16 C 12 4, 20 4, 26 16 C 32 28, 40 28, 46 16 C 52 4, 58 4, 60 10" stroke="#000000" strokeWidth="1.5" fill="none" />
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n))

        // Internal editor
        const ControlEditor = () => {

            const [getAmplitude, setAmplitude] = useState(this.amplitude)
            const [getFrequency, setFrequency] = useState(this.frequency)
            const [getPhase, setPhase] = useState(this.phase)
            const [getBias, setBias] = useState(this.bias)

            useEffect(() => {
                if (isNumber(getAmplitude)) {
                    this.amplitude = Number(getAmplitude)
                    this.component && this.component.forceUpdate();
                }
            }, [getAmplitude])

            useEffect(() => {
                if (isNumber(getFrequency)) {
                    this.frequency = Number(getFrequency)
                    this.component && this.component.forceUpdate();
                }
            }, [getFrequency])

            useEffect(() => {
                if (isNumber(getPhase)) {
                    this.phase = Number(getPhase)
                    this.component && this.component.forceUpdate();
                }
            }, [getPhase])

            useEffect(() => {
                if (isNumber(getBias)) {
                    this.bias = Number(getBias)
                    this.component && this.component.forceUpdate();
                }
            }, [getBias])

            return <div>
                <p>This block outputs Amplitude * sin(Frequency * t + Phase) + Bias. Frequency is in rad/s, Phase in rad.</p>
                <InputGroup label={'Amplitude'} value={getAmplitude} setValue={e => setAmplitude(e)} />
                <InputGroup label={'Frequency (rad/s)'} value={getFrequency} setValue={e => setFrequency(e)} />
                <InputGroup label={'Phase (rad)'} value={getPhase} setValue={e => setPhase(e)} />
                <InputGroup label={'Bias'} value={getBias} setValue={e => setBias(e)} />
            </div>
        }

        useModal.configure(this, 'Sine Wave Block', <ControlEditor />, true);
    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            amplitude: this.amplitude,
            frequency: this.frequency,
            phase: this.phase,
            bias: this.bias
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.amplitude = event.data.amplitude ?? 1;
        this.frequency = event.data.frequency ?? 1;
        this.phase = event.data.phase ?? 0;
        this.bias = event.data.bias ?? 0;
    }
}

export default SineWaveModel
