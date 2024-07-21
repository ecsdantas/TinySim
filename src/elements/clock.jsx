import React from 'react';
import { SimNodeModel } from '../SimNodeModel'
import Simulation from '../simulation/core';

class ClockModel extends SimNodeModel {

    kind = 'add'
    settings = null

    constructor(options = {}) {
        super({...options});

        // Create the ports of add model
        this.createPort('out', false);
    }

    // Função principal do bloco
    solution() { 
        return Simulation.getTime()[Simulation.getStep()]
    }

    icon = () => <svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
}

export default ClockModel