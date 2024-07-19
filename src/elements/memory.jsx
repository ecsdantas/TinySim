import React from 'react';
import { SimNodeModel } from '../SimNodeModel'

const Icon = () => <svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth={1} />
        <path
            d="M12.4,17.8c3.3,0.4,6.2-1.8,6.6-5.2C19.4,9.2,17.1,6.3,13.7,5.9c-3.4-0.4-6.3,2-6.7,5.3c-0.1,1.3,0.0,2.5,0.5,3.3M4.0,12.8c0,0,3.1,1.8,3.5,1.6c0.4-0.1,2.0-3.3,2.0-3.3"
            stroke="#0c0310"
            strokeWidth={1}
            strokeLinecap="round"
        />
</svg>

class MemoryModel extends SimNodeModel {

    kind = 'memory'
    icon = Icon
    settings = null
    initialValue = 0
    memoryValue = this.initialValue
    lastStep = null
     
    constructor(options = {}, initialValue) {
        const s = super({
            ...options
        });
        
        // Define the initial value
        this.memoryValue = initialValue
        
        // Create the ports of add model
        s.createPort('out', false);
        s.createPort('in', true);
    }

    solve(simControl){
        if (!simControl.step){
            throw console.error('Unable to simulate without simControl');
        }
        const outValue = this.memoryValue;
        if ((simControl.step !== this.lastStep) || this.lastStep === null){
            const inpt = this.getNodeByInput(0);
            this.lastStep = simControl.step
            this.memoryValue = (inpt && inpt.solve)? inpt.solve(simControl) : 0;
        }
        return outValue
    }

    reset(){
        this.memoryValue = this.initialValue
        this.lastStep = null
    }

}

export default MemoryModel