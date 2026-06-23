import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class ZeroOrderModel extends SimNodeModel {

    kind = 'zeroOrder';
    CGenUID = 'zo';
    memoryValue = 0;
    constantA = 1.0; // Correspondente ao 'a' em (s + a)
    lastStepSolved = null;
    tags = ['zero order', 's+a', 'laplace', 'simulation', 'control system', 'numerical analysis'];

    constructor(options = {}, constantA = 1.0) {
        super({ ...options, name: 'zero_order' });

        // Define valores iniciais
        this.constantA = constantA;
        this.memoryValue = 0;

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

        // Equação: derivative = (input - memoryValue) / stepTime; memoryValue = input;
        // output = derivative + a * input
        const derivative = (inputValue - this.memoryValue) / stepTime;
        this.memoryValue = inputValue;
        const outputValue = derivative + this.constantA * inputValue;

        // Retorna o valor calculado
        return { 'out': outputValue };
    }

    reset() {
        super.reset();
        this.memoryValue = 0;
        this.lastStepSolved = null;
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
    <text x="9" y="20" fontFamily="Arial" fontSize="9" fill="#000000">1</text>
    <line x1="6" x2="17" y1="12" y2="12" fontFamily="Arial" strokeWidth="1" stroke="#000000" />
    <text x="4" y="11" fontFamily="Arial" fontSize="10" fill="#000000">s+a</text>
</svg>

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n));

        // Editor interno
        const ControlEditor = () => {

            const [getConstantA, setConstantA] = useState(this.constantA);

            useEffect(() => {
                if (isNumber(getConstantA)) {
                    this.constantA = Number(getConstantA);
                    this.component && this.component.forceUpdate();
                }
            }, [getConstantA]);

            return <div>
                <p>The Zero Order block implements the equation (s + a). It combines the derivative of the input with a constant multiplication factor.</p>
                <p>It's a numerical solution depending on sampling time.</p>
                <InputGroup label={'Constant (a)'} value={getConstantA} setValue={e => setConstantA(e)} />
            </div>;
        };

        useModal.configure(this, 'Zero Order Block', <ControlEditor />, true);
    };

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            constantA: this.constantA,
            memoryValue: this.memoryValue,
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.constantA = event.data.constantA,
        this.memoryValue = event.data.memoryValue
    }
}

export default ZeroOrderModel;
