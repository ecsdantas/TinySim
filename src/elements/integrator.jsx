import React from 'react';
import { SimNodeModel } from '../SimNodeModel'
import Simulation from '../simulation/core';

class IntegratorModel extends SimNodeModel {

    kind = 'integrator'
    settings = null
    initialValue = 0
    memoryValue = this.initialValue
    lastStepSolved = null
     
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
            return outValue
        }
        this.lastStepSolved = Simulation.getCurrentStep()
        // Realiza o calculo nominal
        const inpt = this.getNodeByInput(0);
        this.memoryValue += ((inpt && inpt.solve)? inpt.solve() : 0) * Simulation.getStepTime()
        // Retorna o valor antigo da memória
        return outValue
    }

    reset(){
        super.reset()
        this.memoryValue = this.initialValue
        this.lastStepSolved = null
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
    <text x="8" y="11" font-family="Arial" fontSize="10" fill="#000000">1</text>
    <line x1="6" x2="17" y1="12" y2="12" fontFamily="Arial" strokeWidth="1" stroke="#000000" />
    <text x="9" y="20" font-family="Arial" fontSize="10" fill="#000000">s</text>
</svg>
    
}

export default IntegratorModel