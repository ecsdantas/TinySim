import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';

class DerivatorModel extends SimNodeModel {

    kind = 'derivator'
    breaksAlgebraicLoop = true
    previousInput = 0
    previousOutput = 0
    lastStepSolved = null
    CGenUID = 'der'
    tags = ['derivatior', 'derivate', 'limit', 's', 'laplace', 'differentiation', 'calculus', 'math', 'signal processing', 'rate of change']


    constructor(options = {}) {
        super({...options, name: 'derivator'});
        
        // Create the ports of derivator model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        // Prevents algebraic loop
        if (this.lastStepSolved === Simulation.getCurrentStep()){
            return {'out': this.previousOutput}
        }
        this.lastStepSolved = Simulation.getCurrentStep()

        const inpt = this.getNodeByInput(0);
        const currentInput = (inpt && inpt.solve) ? inpt.solve() : 0;
        const derivative = (currentInput - this.previousInput) / Simulation.getStepTime();
        this.previousInput = currentInput;
        this.previousOutput = derivative;
        return {'out': derivative};
    }

    reset(){
        super.reset()
        this.previousInput = 0
        this.previousOutput = 0
        this.lastStepSolved = null
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <text x="9" y="15" fontFamily="Arial" fontSize="12" fill="#000000">s</text>
    </svg>

    settings = _ => {

        // Internal editor
        const ControlEditor = () => {
            return <div>
                <p>The Derivator block computes the derivative of the input signal over time, delivering the rate of change of the input.</p>
            </div>
        }

        useModal.configure(this, 'Derivator Block', <ControlEditor />, true);

    }
    
}

export default DerivatorModel
