import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class ConstantModel extends SimNodeModel {

    kind = 'constant'
    CGenUID = 'in'
    tags = ['constant', 'fix', 'input', 'number', 'static', 'value']
    value = 0

    constructor(options = {}, value = 10) {
        super({ ...options, name: 'constant' });

        // Create the ports of add model
        this.createPort('out', false);
        this.value = value
    }

    // Função principal do bloco
    solution() {
        return { 'out': this.value }
    }

    icon = () => {
        const text = this.value.toString()
        const selector = text.length - 1;
        const fontSize = [12, 12, 11, 9, 7].at(selector) ?? 7;
        return (<svg width="40" height="32" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth={1} strokeLinejoin="round">
            <rect x="1" y="1" width="27" height="21" />
            <text x={14.2} y={15} fontFamily="Arial" fontSize={fontSize} textAnchor="middle" stroke='none' fill="#000000">
                { selector > 4? text.slice(0, 4) + '...' : text }
            </text>
        </svg>)
    }

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n))
        }

        // Editor interno
        const ControlEditor = () => {

            const [getCodeGenName, setCodeGenName] = useState(this.codeGenName)
            const [getConstant, setConstant] = useState(this.value)
            useEffect(() => {
                if (isNumber(getConstant)) {
                    this.value = Number(getConstant)
                    this.component && this.component.forceUpdate();
                }
                this.codeGenName = getCodeGenName
            }, [getConstant, getCodeGenName])

            return <div>
                <p>This blocks outputs a constant.</p>
                <InputGroup label={'Constant value'} value={getConstant} setValue={e => setConstant(e)} />
            </div>
        }

        useModal.configure(this, 'Add Block', <ControlEditor />, true);

    }

    serialize() {
        return {
            ...super.serialize(),
            kind: this.kind,
            value: this.value
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.value = event.data.value || 0;
    }
}

export default ConstantModel