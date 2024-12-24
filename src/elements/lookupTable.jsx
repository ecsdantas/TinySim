import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import { InputGroup, SelectGroup } from '../components/inputGroup';

class LookupTableModel extends SimNodeModel {

    kind = 'lookupTable';
    CGenUID = 'luk';
    tags = ['lookup', 'table', 'map', 'fit'];
    lookupTable = [[10, 20], [15, 22], [18, 33]];
    interpolationMethod = 'nearest'; // Default interpolation method

    constructor(options = {}, lookupTable = []) {
        super({ ...options, name: 'lookupTable' });

        // Define the lookup table
        this.lookupTable = lookupTable;

        // Create the ports of lookup table model
        this.createPort('out', false);
        this.createPort('in', true);
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            const inputValue = inpt.solve();

            switch (this.interpolationMethod) {
                case 'nearest':
                    return { 'out': this.nearestInterpolation(inputValue) };
                case 'linear':
                    return { 'out': this.linearInterpolation(inputValue) };
                case 'stepwise':
                    return { 'out': this.stepwiseInterpolation(inputValue) };
                default:
                    return { 'out': NaN };
            }
        }
        return { 'out': NaN };
    }

    nearestInterpolation(inputValue) {
        let closest = this.lookupTable[0];
        let minDiff = Math.abs(inputValue - closest[0]);
        for (let i = 1; i < this.lookupTable.length; i++) {
            const diff = Math.abs(inputValue - this.lookupTable[i][0]);
            if (diff < minDiff) {
                minDiff = diff;
                closest = this.lookupTable[i];
            }
        }
        return closest[1];
    }

    linearInterpolation(inputValue) {
        for (let i = 0; i < this.lookupTable.length - 1; i++) {
            const [x1, y1] = this.lookupTable[i];
            const [x2, y2] = this.lookupTable[i + 1];
            if (x1 <= inputValue && inputValue <= x2) {
                const slope = (y2 - y1) / (x2 - x1);
                return y1 + slope * (inputValue - x1);
            }
        }
        return NaN; // Out of bounds
    }

    stepwiseInterpolation(inputValue) {
        for (let i = 0; i < this.lookupTable.length - 1; i++) {
            const [x1, y1] = this.lookupTable[i];
            if (inputValue < this.lookupTable[i + 1][0]) {
                return y1;
            }
        }
        return this.lookupTable[this.lookupTable.length - 1][1];
    }

    reset() {
        super.reset();
    }

    icon = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
            <text x="4" y="15" fontFamily="Arial" fontSize="9" fill="#000000">LUT</text>
        </svg>
    );

    settings = _ => {
        const isNumberArray = arr => {
            return arr.every(pair => Array.isArray(pair) && pair.length === 2 && !isNaN(Number(pair[0])) && !isNaN(Number(pair[1])));
        };

        // Internal editor
        const ControlEditor = () => {
            const [getTable, setTable] = useState(JSON.stringify(this.lookupTable));
            const [getInterpolation, setInterpolation] = useState(this.interpolationMethod);
            const [getError, setError] = useState(false);

            useEffect(() => {
                try {
                    const parsedTable = JSON.parse(getTable);
                    if (isNumberArray(parsedTable)) {
                        setError(false);
                        this.lookupTable = parsedTable;
                        this.component && this.component.forceUpdate();
                    }
                } catch (e) {
                    setError(true);
                }
            }, [getTable]);

            useEffect(() => {
                this.interpolationMethod = getInterpolation;
                this.component && this.component.forceUpdate();
            }, [getInterpolation]);

            return (
                <div>
                    <p>This block uses a lookup table to determine the output based on the input value.</p>
                    <InputGroup label={'Table'} value={getTable} setValue={e => setTable(e)} />
                    <SelectGroup
                        label="Interpolation Method"
                        value={getInterpolation}
                        setValue={setInterpolation}
                        options={[
                            { value: 'nearest', label: 'Nearest' },
                            { value: 'linear', label: 'Linear' },
                            { value: 'stepwise', label: 'Stepwise' }
                        ]}
                    />
                    {getError && <p className='danger'>Invalid lookup table format</p>}
                </div>
            );
        };

        useModal.configure(this, 'Lookup Table Block', <ControlEditor />, true);
    };
}

export default LookupTableModel;
