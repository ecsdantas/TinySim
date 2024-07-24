import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';
import { SelectGroup } from '../components/inputGroup';

class RelationalOperatorModel extends SimNodeModel {

    kind = 'comparator'
    operator = 'equal'

    constructor(options = {}, operator = 'equal') {
        super({...options, name: 'comparator'});

        // Define the initial operator
        this.operator = operator;
        
        // Create the ports of relational operator model
        this.createPort('out', false);
        this.createPort('in1', true);
        this.createPort('in2', true);
    }

    // Main function of the block
    solution() {
        const inpt1 = this.getNodeByInput(0);
        const inpt2 = this.getNodeByInput(1);
        
        if (inpt1 && inpt1.solve && inpt2 && inpt2.solve) {
            const value1 = inpt1.solve();
            const value2 = inpt2.solve();
            switch(this.operator) {
                case 'greaterThanOrEqual':
                    return {'out': Number(value1 >= value2)};
                case 'greaterThan':
                    return {'out': Number(value1 > value2)};
                case 'equal':
                    return {'out': Number(value1 === value2)};
                case 'lowerThanOrEqual':
                    return {'out': Number(value1 <= value2)};
                case 'lowerThan':
                    return {'out': Number(value1 < value2)};
                case 'different':
                    return {'out': Number(value1 !== value2)};
                default:
                    return {'out': NaN};
            }
        }
        return {'out': NaN};
    }

    reset(){
        super.reset();
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

        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
                <text x="6" y="15" fontFamily="Arial" fontSize="10" fill="#000000">{operatorSymbol}</text>
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

            useEffect(() => {
                this.operator = getOperator;
                this.component && this.component.forceUpdate();
            }, [getOperator]);

            return <div>
                <p>This block compares Input 1 with Input 2 based on the selected operator.</p>
                <SelectGroup label={'Operator'} value={getOperator} setValue={e => setOperator(e)} options={operators.map(op => ({ value: op.value, label: op.label }))} />
            </div>
        }

        useModal.configure(this, 'Relational Operator Block', <ControlEditor />, true);

    }
    
}

export default RelationalOperatorModel
