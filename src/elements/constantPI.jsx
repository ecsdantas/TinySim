import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel';

class PiModel extends SimNodeModel {

    kind = 'pi'
    CGenUID = 'pi'
    tags = ['constant', 'fix', 'input', 'number', 'static', 'pi', '3.141592']
    value = Math.PI

    constructor(options = {}) {
        super({...options, name: 'pi'});
        
        // Create the ports of add model
        this.createPort('out', false);
    }

    // Função principal do bloco
    solution() { 
        return {'out': Math.PI}
    }

    icon = _ => <svg width={ 32 } height={ 32 } viewBox={`0 0 32 32`} fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x={2} y={2} width={ 28 } height={ 28 } stroke="#000000" strokeWidth={1.2} strokeLinejoin="round" />
        <text x="15" y="22" fontFamily="Segoe UI" fontSize={ 24 } textAnchor="middle" fill="#000000">π</text>
    </svg>

}

export default PiModel
