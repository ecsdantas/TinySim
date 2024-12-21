import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal  } from '../components/modal';
import { InputGroup  } from '../components/inputGroup';

class GainModel extends SimNodeModel {

    kind = 'gain'
    gainValue = 1
    CGenUID = 'g'
    tags = ['gain','scale','multiply']   

    constructor(options = {}, gain = 0.5) {
        super({ ...options, name: 'gain' });

        // Updates the internal gain
        this.gainValue = gain

        // Create the ports of add model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Função principal do bloco
    solution() {
        const inpt = this.getNodeByInput(0);
        const out = (inpt && inpt.solve) ? inpt.solve() * this.gainValue : 0
        return {'out': out}
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <path d="M16.7,9.3c1.4,0.9,2.2,1.4,2.4,2.0c0.2,0.5,0.2,1.1,0.0,1.6c-0.2,0.6-0.9,1.1-2.4,2.0l-6.8,4.2c-1.6,1.0-2.4,1.4-3.1,1.4c-0.6,0.0-1.2-0.3-1.4-0.8c-0.4-0.5-0.4-1.4-0.4-3.0V7.8c0-2.0,0.0-3.2,0.4-3.8c0.3-0.5,0.9-0.8,1.5-0.8c0.7,0.0,1.6,0.5,3.2,1.5l6.8,4.2z" stroke="#000000" strokeWidth={1} strokeLinejoin="round" />
    </svg>

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n))
        }

        // Editor interno
        const ControlEditor = () => {

            const [getConstant, setConstant] = useState(this.gainValue)
            useEffect(() => {
                if (isNumber(getConstant)) {
                    this.gainValue = Number(getConstant)
                    this.component && this.component.forceUpdate();
                }
            }, [getConstant])

            return <div>
                <p>This blocks outputs the input multiplied by a gain.</p>
                <InputGroup label={'Gain value'} value={getConstant} setValue={e => setConstant(e)} />
            </div>
        }

        useModal.configure(this, 'Gain Block', <ControlEditor />, true);

    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            gainValue: this.gainValue
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.gainValue = event.data.gainValue || 1;
    }
}

export default GainModel