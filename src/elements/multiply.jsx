import React from 'react';
import { VariadicMathModel } from './variadicMathModel'

class MultiplyModel extends VariadicMathModel {

    kind = 'multiply'
    tags = ['multiply', 'times', 'product', 'arithmetic', 'math', 'operation']
    CGenUID = 'mul'

    identity = 1
    seedFromFirstInput = false
    modalTitle = 'Multiply Block'
    helpText = <>This block multiplies the values from all input ports.<br />You can add new ports.</>

    constructor(options = {}) {
        super(options, 'multiply');
    }

    combine(acc, value) {
        return acc * value;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="7" y1="7" x2="17" y2="17" stroke="#000000" strokeWidth={1} />
        <line x1="17" y1="7" x2="7" y2="17" stroke="#000000" strokeWidth={1} />
    </svg>
}

export default MultiplyModel
