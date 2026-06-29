import React from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel'
import { isVectorSignal } from '../simulation/vectorSignal'


class DisplayModel extends SimNodeModel {

    kind = 'display'
    CGenUID = 'out'
    tags = ['display', 'output', 'view', 'screen', 'monitor', 'visual', 'interface']
    isTerminalBlock = true
    value = null;

    constructor(options = {}) {
        super({...options, name: 'display'});
        this.createPort('in', true);
    }

    // Função principal do bloco
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            this.value = inpt.solve();
            this.update()
            return {'out': this.value};
        }
        this.value = 'offline'
        this.update()
    }

    reset(){
        this.value = null
    }

    formattedValue() {
        if (isVectorSignal(this.value)) {
            return `[${this.value.map((v) => Number(v).toFixed(2)).join(', ')}]`;
        }
        return this.value;
    }

    icon = () => <svg width={100} height={30} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x={4} y={0} width={'100%'} height={'100%'} fill='#000000' />
        <text x="10" y={ (30+12)/2 - 1 } fontSize={12} fill='#FFFFFF'>{this.formattedValue()}</text>
    </svg>
    
    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            isTerminalBlock: this.isTerminalBlock,
            value: this.value
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.value = event.data.value || null;
    }

    
}

export default DisplayModel