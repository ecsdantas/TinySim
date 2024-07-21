import React from 'react';
import { SimNodeModel } from '../SimNodeModel'
import Simulation from '../simulation/core';

class MemoryModel extends SimNodeModel {

    kind = 'memory'
    settings = null
    initialValue = 0
    memoryValue = this.initialValue
    lastStepSolved = null
     
    constructor(options = {}, initialValue = 8) {
        super({...options});
        
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
            return outValue
        }
        this.lastStepSolved = Simulation.getCurrentStep()
        // Realiza o calculo nominal
        const inpt = this.getNodeByInput(0);
        this.memoryValue = (inpt && inpt.solve)? inpt.solve() : 0
        // Retorna o valor antigo da memória
        return outValue
    }

    reset(){
        super.reset()
        this.memoryValue = this.initialValue
        this.lastStepSolved = null
    }

    icon = () => <svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth={1} />
        <path
            d="M12.4,17.8c3.3,0.4,6.2-1.8,6.6-5.2C19.4,9.2,17.1,6.3,13.7,5.9c-3.4-0.4-6.3,2-6.7,5.3c-0.1,1.3,0.0,2.5,0.5,3.3M4.0,12.8c0,0,3.1,1.8,3.5,1.6c0.4-0.1,2.0-3.3,2.0-3.3"
            stroke="#0c0310"
            strokeWidth={1}
            strokeLinecap="round"
        />
    </svg>
    
}

export default MemoryModel