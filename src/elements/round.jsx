import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';
import { InputGroup, SelectGroup } from '../components/inputGroup';

class RoundModel extends SimNodeModel {

    kind = 'round'
    decimalPlaces = 0
    CGenUID = 'rnd';
    tags = ['round', 'ceil', 'floor'];
    roundType = 'round';

    constructor(options = {}, decimalPlaces = 0, roundType = 'round') {
        super({ ...options, name: 'round' });

        // Initialize properties
        this.decimalPlaces = decimalPlaces;
        this.roundType = roundType;

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

            // Apply rounding based on selected type
            let result;
            switch (this.roundType) {
                case 'ceil':
                    result = Math.ceil(value * factor) / factor;
                    break;
                case 'floor':
                    result = Math.floor(value * factor) / factor;
                    break;
                default:
                    result = Math.round(value * factor) / factor;
            }

            return { 'out': result };
        }
        return { 'out': NaN };
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1" />
        <text x="5" y="15" fontFamily="Arial" fontSize="9" fill="#000000">
            {
                this.roundType.replace(/[ou]/g,"")
            }
            </text>
    </svg>;

    settings = _ => {

        const isNumber = (n) => !isNaN(Number(n));

        // Internal editor
        const ControlEditor = () => {

            const [getDecimalPlaces, setDecimalPlaces] = useState(this.decimalPlaces);
            const [getRoundType, setRoundType] = useState(this.roundType);

            useEffect(() => {
                if (isNumber(getDecimalPlaces)) {
                    this.decimalPlaces = Number(getDecimalPlaces);
                    this.component && this.component.forceUpdate();
                }
            }, [getDecimalPlaces]);

            useEffect(() => {
                this.roundType = getRoundType;
                this.component && this.component.forceUpdate();
            }, [getRoundType]);

            return <div>
                <p>This block rounds the input value to the specified number of decimal places<br />and allows selecting the rounding type.</p>
                <InputGroup label={'Decimal Places'} value={getDecimalPlaces} setValue={e => setDecimalPlaces(e)} />
                <SelectGroup label={'Rounding Type'} value={getRoundType} setValue={e => setRoundType(e)} 
                    options={[{ value: 'round', label: 'Round' }, { value: 'ceil', label: 'Ceil' }, { value: 'floor', label: 'Floor' }]} />
            </div>;
        };

        useModal.configure(this, 'Round Block', <ControlEditor />, true);

    };

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            decimalPlaces: this.decimalPlaces,
            roundType: this.roundType
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.decimalPlaces = event.data.decimalPlaces;
        this.roundType = event.data.roundType;
    }
    
}

export default RoundModel
