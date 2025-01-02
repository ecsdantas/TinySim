import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';
import { InputGroup, SelectGroup } from '../components/inputGroup';

class RelationalConstantOperatorModel extends SimNodeModel {

    kind = 'comparatorConstant'
    operator = 'equal'
    tags = ['comparator', 'greater', 'equal', 'lower', 'different', 'comparison', 'relational', 'operator', 'constant'];
    CGenUID = 'cmp';
    constant = 0;


    constructor(options = {}, operator = 'equal') {
        super({...options, name: 'comparator'});

        // Define the initial operator
        this.operator = operator;
        
        // Create the ports of relational operator model
        this.createPort('out', false);
        this.createPort('in1', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        
        if (inpt1 && inpt1.solve) {
            const value1 = inpt1.solve();
            const value2 = this.constant;
            switch(this.operator) {
                case 'greaterThanOrEqual':
                    return {'out': Number(value1 >= value2)};
                case 'greaterThan':
                    return {'out': Number(value1 > value2)};
                case 'equal':
                    return {'out': Number(value1 == value2)};
                case 'lowerThanOrEqual':
                    return {'out': Number(value1 <= value2)};
                case 'lowerThan':
                    return {'out': Number(value1 < value2)};
                case 'different':
                    return {'out': Number(value1 != value2)};
                default:
                    return {'out': NaN};
            }
        }
        return {'out': NaN};
    }

    icon = () => {
        let operatorSymbol;
        switch(this.operator) {
            case 'greaterThanOrEqual':
                operatorSymbol = '>=';
                break;
            case 'greaterThan':
                operatorSymbol = '>';
                break;
            case 'equal':
                operatorSymbol = '==';
                break;
            case 'lowerThanOrEqual':
                operatorSymbol = '<=';
                break;
            case 'lowerThan':
                operatorSymbol = '<';
                break;
            case 'different':
                operatorSymbol = '!=';
                break;
            default:
                operatorSymbol = '==';
        }

        operatorSymbol += this.constant;

        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
                <text x="4" y="15" fontFamily="Arial" fontSize="10" fill="#000000">{operatorSymbol}</text>
            </svg>
        );
    }

    settings = _ => {

        const operators = [
            { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
            { value: 'greaterThan', label: 'Greater than' },
            { value: 'equal', label: 'Equal' },
            { value: 'lowerThanOrEqual', label: 'Lower than or equal' },
            { value: 'lowerThan', label: 'Lower than' },
            { value: 'different', label: 'Different' }
        ];

        // Internal editor
        const ControlEditor = () => {

            const [getOperator, setOperator] = useState(this.operator);
            const [getConstant, setConstant] = useState(this.constant);

            useEffect(() => {
                this.operator = getOperator;
                this.constant = getConstant
                this.component && this.component.forceUpdate();
            }, [getOperator, getConstant]);

            return <div>
                <p>This block compares Input 1 with a constant based on the selected operator.</p>
                <InputGroup label={'Constant'} value={getConstant} setValue={e => setConstant(e)} />
                <SelectGroup label={'Operator'} value={getOperator} setValue={e => setOperator(e)} options={operators.map(op => ({ value: op.value, label: op.label }))} />
            </div>
        }

        useModal.configure(this, 'Relational Operator Block', <ControlEditor />, true);

    }

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            constant: this.constant,
            operator: this.operator
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.operator = event.data.operator;
        this.constant = event.data.constant;
    }
    
}

export default RelationalConstantOperatorModel
