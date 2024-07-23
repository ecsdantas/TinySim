import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class ConstantModel extends SimNodeModel {

    kind = 'constant'
    value = 0

    constructor(options = {}, value = 10) {
        super({...options});
        
        // Create the ports of add model
        this.createPort('out', false);
        this.value = value
    }

    // Função principal do bloco
    solution() { 
        return this.value
    }

    icon = _ => <svg width={ 32 } height={ 32 } viewBox={`0 0 100 100`} fill="none" xmlns="http://www.w3.org/2000/svg" >
        <rect x={5} y={5} width={ 90 } height={ 90 } stroke="#000000" strokeWidth={1.8} strokeLinejoin="round" />
        <text x="50" y="65" fontFamily="Arial" fontSize={ 40 - 2*this.value.toString().slice(0,5).length } textAnchor="middle" fill="#000000">{this.value.toString().slice(0,5)}</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n))
        }

        // Editor interno
        const ControlEditor = () => {

            const [getConstant, setConstant] = useState(this.value)
            useEffect(()=>{
                if (isNumber(getConstant)) {
                    this.value = Number(getConstant)
                    this.component && this.component.forceUpdate();
                }
            }, [getConstant])

            return <div>
                <p>This blocks outputs a constant.</p>
                    <InputGroup label={ 'Constant value'}  value={ getConstant } setValue={ e => setConstant(e) } />
                </div>
        }

        useModal.configure(this, 'Add Block', <ControlEditor />, true);

    }
}

export default ConstantModel