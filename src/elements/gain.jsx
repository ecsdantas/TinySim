import React from 'react';
import { SimNodeModel } from '../SimNodeModel'

const Icon = () => <svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
    <path d="M16.7,9.3c1.4,0.9,2.2,1.4,2.4,2.0c0.2,0.5,0.2,1.1,0.0,1.6c-0.2,0.6-0.9,1.1-2.4,2.0l-6.8,4.2c-1.6,1.0-2.4,1.4-3.1,1.4c-0.6,0.0-1.2-0.3-1.4-0.8c-0.4-0.5-0.4-1.4-0.4-3.0V7.8c0-2.0,0.0-3.2,0.4-3.8c0.3-0.5,0.9-0.8,1.5-0.8c0.7,0.0,1.6,0.5,3.2,1.5l6.8,4.2z" stroke="#000000" strokeWidth={1} strokeLinejoin="round"/>
</svg>

class GainModel extends SimNodeModel {

    kind = 'gain'
    icon = Icon
    settings = null
    gainValue = 1

    constructor(options = {}, gain = 1) {
        const s = super({
            ...options
        });
        
        // Updates the internal gain
        this.gainValue = gain

        // Create the ports of add model
        s.createPort('out', false);
        s.createPort('in', true);
    }

    solve(simControl){
        const inpt = this.getNodeByInput(0)
        if (inpt && inpt.solve)
            return inpt.solve(simControl) * this.gainValue
        return 0
    }

}

export default GainModel