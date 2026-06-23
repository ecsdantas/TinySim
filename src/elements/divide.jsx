import React from 'react';
import { VariadicMathModel } from './variadicMathModel'

class DivideModel extends VariadicMathModel {

    kind = 'divide'
    CGenUID = 'div'
    tags = ['divide', 'div', 'math', 'arithmetic', 'operation', 'division']

    identity = 0
    seedFromFirstInput = true
    modalTitle = 'Divide Block'
    helpText = <>This block divides the first input value by all subsequent input values.<br />You can add new ports.</>

    constructor(options = {}) {
        super(options, 'divide');
    }

    combine(acc, value) {
        if (value === 0) return NaN; // Avoid division by zero
        return acc / value;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="7" y1="12" x2="17" y2="12" stroke="#000000" strokeWidth={1} />
        <circle cx="12" cy="8" r="1" fill="#000000" />
        <circle cx="12" cy="16" r="1" fill="#000000" />
    </svg>
}

export default DivideModel
