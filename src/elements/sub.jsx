import React from 'react';
import { VariadicMathModel } from './variadicMathModel'

class SubModel extends VariadicMathModel {

    kind = 'sub'
    CGenUID = 'sub'
    tags = ['sub', 'minus', 'subtract', 'math', 'operation', 'arithmetic', 'calculation']

    identity = 0
    seedFromFirstInput = true
    isLinearCombination = true
    combineSign = -1
    modalTitle = 'Sub Block'
    helpText = <>This blocks subtract the values from in1 port.<br />You can add new ports to subtract.</>

    constructor(options = {}) {
        super(options, 'sub');
    }

    combine(acc, value) {
        return acc - value;
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth={1} />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#000000" strokeWidth={1} />
    </svg>
}

export default SubModel
