import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class IntegratorModel extends SimNodeModel {

    kind = 'integrator'
    CGenUID = 'int'
    initialValue = 0
    memoryValue = this.initialValue
    lastStepSolved = null
    tags = ['integrator', 'integral', '1/s', 'laplace', 'math', 'calculus', 'signal processing', 'control systems', 'differential equations']
     
    constructor(options = {}, initialValue = 0) {
        super({...options, name: 'integrator'});
        
        // Define the initial value
        this.initialValue = initialValue
        this.memoryValue = initialValue
        
        // Create the ports of add model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Função principal do bloco
    solution() {
        const outValue = this.memoryValue;
        // Previne loop algébrico
        if (this.lastStepSolved === Simulation.getCurrentStep()){
            return {'out':  outValue}
        }
        this.lastStepSolved = Simulation.getCurrentStep()
        // Realiza o calculo nominal
        const inpt = this.getNodeByInput(0);
        this.memoryValue += ((inpt && inpt.solve)? inpt.solve() : 0) * Simulation.getStepTime()
        // Retorna o valor antigo da memória
        return {'out':  outValue}
    }

    reset(){
        super.reset()
        this.memoryValue = this.initialValue
        this.lastStepSolved = null
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <text x="8" y="11" fontFamily="Arial" fontSize="10" fill="#000000">1</text>
        <line x1="6" x2="17" y1="12" y2="12" fontFamily="Arial" strokeWidth="1" stroke="#000000" />
        <text x="9" y="20" fontFamily="Arial" fontSize="10" fill="#000000">s</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n))
        }

        // Editor interno
        const ControlEditor = () => {

            const [getValue, setValue] = useState(this.initialValue)
            useEffect(()=>{
                if (isNumber(getValue)) {
                    this.initialValue = Number(getValue)
                    this.component && this.component.forceUpdate();
                }
            }, [getValue])

            return <div>
                <p>The Integrator block sums the input with its internal value, delivering an integrated signal over time to the output. It uses the step time to compute the integration.</p>
                    <InputGroup label={ 'Initial Condition'}  value={ getValue } setValue={ e => setValue(e) } />
                </div>
        }

        useModal.configure(this, 'Integrator Block', <ControlEditor />, true);

    }

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            initialValue: this.initialValue
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.initialValue = event.data.initialValue;
    }
    
}

export default IntegratorModel