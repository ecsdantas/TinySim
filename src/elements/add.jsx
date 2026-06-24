import React from 'react';
import { VariadicMathModel } from './variadicMathModel'

class AddModel extends VariadicMathModel {

    kind = 'add'
    CGenUID = 'add'
    tags = ['add', 'sum', 'plus', 'arithmetic', 'math', 'addition']

    identity = 0
    seedFromFirstInput = false
    isLinearCombination = true
    modalTitle = 'Add Block'
    helpText = <>This blocks sum the values from all input ports.<br />You can add new ports.</>

    constructor(options = {}) {
        super(options, 'add');
    }

    combine(acc, value) {
        return acc + value;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="12" y1="6" x2="12" y2="18" stroke="#000000" strokeWidth={1} />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#000000" strokeWidth={1} />
    </svg>
}

export default AddModel
