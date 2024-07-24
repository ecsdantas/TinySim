import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class RoundModel extends SimNodeModel {

    kind = 'round'
    decimalPlaces = 0

    constructor(options = {}, decimalPlaces = 0) {
        super({...options, name: 'round'});

        // Define the initial decimal places
        this.decimalPlaces = decimalPlaces;
        
        // Create the ports of round model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            const value = inpt.solve();
            const factor = Math.pow(10, this.decimalPlaces);
            return {'out': Math.round(value * factor) / factor};
        }
        return {'out': NaN};
    }

    reset(){
        super.reset();
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1" />
        <text x="5" y="15" fontFamily="Arial" fontSize="8" fill="#000000">Rnd</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n));
        }

        // Internal editor
        const ControlEditor = () => {

            const [getDecimalPlaces, setDecimalPlaces] = useState(this.decimalPlaces);

            useEffect(() => {
                if (isNumber(getDecimalPlaces)) {
                    this.decimalPlaces = Number(getDecimalPlaces);
                    this.component && this.component.forceUpdate();
                }
            }, [getDecimalPlaces]);

            return <div>
                <p>This block rounds the input value to the specified number of decimal places.</p>
                <InputGroup label={'Decimal Places'} value={getDecimalPlaces} setValue={e => setDecimalPlaces(e)} />
            </div>
        }

        useModal.configure(this, 'Round Block', <ControlEditor />, true);

    }
    
}

export default RoundModel
