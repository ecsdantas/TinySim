import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class FirstOrderModel extends SimNodeModel {

    kind = 'firstOrder';
    CGenUID = 'fo';
    initialValue = 0;
    memoryValue = this.initialValue;
    dampingFactor = 1; // Correspondente ao 'a' em 1/(s+a)
    lastStepSolved = null;
    tags = ['first_order', '1/(s+a)', 'laplace'];

    constructor(options = {}, initialValue = 0, dampingFactor = 1) {
        super({ ...options, name: 'first_order' });

        // Define valores iniciais
        this.initialValue = initialValue;
        this.memoryValue = initialValue;
        this.dampingFactor = dampingFactor;

        // Cria as portas do modelo
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Função principal do bloco
    solution() {
        const outValue = this.memoryValue;

        // Previne loop algébrico
        if (this.lastStepSolved === Simulation.getCurrentStep()) {
            return { 'out': outValue };
        }

        this.lastStepSolved = Simulation.getCurrentStep();

        // Realiza o cálculo nominal
        const inpt = this.getNodeByInput(0);
        const inputValue = (inpt && inpt.solve) ? inpt.solve() : 0;
        const stepTime = Simulation.getStepTime();

        // Equação: memoryValue += (inputValue - a * memoryValue) * stepTime
        this.memoryValue += (inputValue - this.dampingFactor * this.memoryValue) * stepTime;

        // Retorna o valor antigo da memória
        return { 'out': outValue };
    }

    reset() {
        super.reset();
        this.memoryValue = this.initialValue;
        this.lastStepSolved = null;
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <text x="9" y="11" fontFamily="Arial" fontSize="10" fill="#000000">1</text>
        <line x1="6" x2="17" y1="12" y2="12" fontFamily="Arial" strokeWidth="1" stroke="#000000" />
        <text x="4" y="20" fontFamily="Arial" fontSize="10" fill="#000000">s+a</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n));

        // Editor interno
        const ControlEditor = () => {

            const [getInitialValue, setInitialValue] = useState(this.initialValue);
            const [getDampingFactor, setDampingFactor] = useState(this.dampingFactor);

            useEffect(() => {
                if (isNumber(getInitialValue)) {
                    this.initialValue = Number(getInitialValue);
                    this.component && this.component.forceUpdate();
                }
            }, [getInitialValue]);

            useEffect(() => {
                if (isNumber(getDampingFactor)) {
                    this.dampingFactor = Number(getDampingFactor);
                    this.component && this.component.forceUpdate();
                }
            }, [getDampingFactor]);

            return <div>
                <p>The First Order block implements the equation 1 / (s + a). It combines an integrator with a damping factor to smooth the output response.</p>
                <InputGroup label={'Initial Condition'} value={getInitialValue} setValue={e => setInitialValue(e)} />
                <InputGroup label={'Damping Factor (a)'} value={getDampingFactor} setValue={e => setDampingFactor(e)} />
            </div>;
        };

        useModal.configure(this, 'First Order Block', <ControlEditor />, true);
    };
}

export default FirstOrderModel;
