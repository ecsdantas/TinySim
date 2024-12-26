import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class ZOHModel extends SimNodeModel {

    kind = 'zero-order-hold';
    CGenUID = 'zoh';
    lastValue = 0;
    lastStepSolved = null;
    sampleTime = 1; // Default sample time in seconds
    tags = ['zoh', 'zero_order_hold', 'sample_and_hold'];

    constructor(options = {}, sampleTime = 1) {
        super({ ...options, name: 'zero_order_hold' });

        // Define valores iniciais
        this.sampleTime = sampleTime;
        this.lastValue = 0;

        // Cria as portas do modelo
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Função principal do bloco
    solution() {
        const outValue = this.lastValue;

        // Previne loop algébrico
        if (this.lastStepSolved === Simulation.getCurrentStep()) {
            return { 'out': outValue };
        }

        this.lastStepSolved = Simulation.getCurrentStep();

        // Realiza o cálculo nominal
        const inpt = this.getNodeByInput(0);
        const inputValue = (inpt && inpt.solve) ? inpt.solve() : 0;
        const currentTime = Simulation.getCurrentTime();

        // Atualiza o valor somente se o tempo for múltiplo do tempo de amostragem
        if (currentTime % this.sampleTime === 0) {
            this.lastValue = inputValue;
        }

        // Retorna o valor mantido
        return { 'out': this.lastValue };
    }

    reset() {
        super.reset();
        this.lastValue = 0;
        this.lastStepSolved = null;
    }

    icon = () => <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="4" width="32" height="26" stroke="#000000" strokeWidth="1" />
        <text x="4" y="21" fontFamily="Arial" fontSize="12" fill="#000000">ZOH</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n));

        // Editor interno
        const ControlEditor = () => {

            const [getSampleTime, setSampleTime] = useState(this.sampleTime);

            useEffect(() => {
                if (isNumber(getSampleTime)) {
                    this.sampleTime = Number(getSampleTime);
                    this.component && this.component.forceUpdate();
                }
            }, [getSampleTime]);

            return <div>
                <p>The Zero Order Hold (ZOH) block holds the input value constant over the sampling interval. It is commonly used in digital control systems.</p>
                <InputGroup label={'Sample Time'} value={getSampleTime} setValue={e => setSampleTime(e)} />
            </div>;
        };

        useModal.configure(this, 'Zero Order Hold Block', <ControlEditor />, true);
    };


    serialize() {
        const data = super.serialize();
        return {
            ...data,
            sampleTime: this.sampleTime
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.reset();
        this.sampleTime = sampleTime;
    }
}

export default ZOHModel;
