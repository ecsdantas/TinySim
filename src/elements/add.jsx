import React from 'react';
import { SimNodeModel } from '../SimNodeModel'

const Icon = () => <svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
    <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
    <line x1="12" y1="6" x2="12" y2="18" stroke="#000000" strokeWidth={1} />
    <line x1="6" y1="12" x2="18" y2="12" stroke="#000000" strokeWidth={1} />
</svg>


class AddModel extends SimNodeModel {

    kind = 'add'
    icon = Icon
    settings = null

    constructor(options = {}) {
        const s = super({
            ...options
        });
        
        // Create the ports of add model
        s.createPort('out', false);
        s.createPort('in1', true);
        s.createPort('in2', true);
    }

    solve(simControl){
        let sum = 0;
        for(let i = 0; i < this.getInPorts().length; i ++){
            const inpt = this.getNodeByInput(i)
            if (inpt && inpt.solve){
                sum += inpt.solve(simControl)
            }
        }
        return sum
    }

}

export default AddModel