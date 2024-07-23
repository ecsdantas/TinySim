import React, { useState } from 'react';
import { SimNodeModel } from '../SimNodeModel'


class DisplayModel extends SimNodeModel {

    kind = 'display'
    isTerminalBlock = true
    settings = null
    
    constructor(options = {}) {
        super({...options, name: 'display'});
        this.createPort('in', true);
        this.value = null;
        this.component = null;
    }

    // Função principal do bloco
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            this.value = inpt.solve();
            if (this.component) {
                this.component.forceUpdate();
            }
            return this.value;
        }
    }

    icon = () => <svg width={100} height={30} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x={4} y={0} width={'100%'} height={'100%'} fill='#000000' /> 
        <text x="10" y={ (30+12)/2 - 1 } fontSize={12} fill='#FFFFFF'>{this.value}</text>
    </svg>
    
    
}

export default DisplayModel