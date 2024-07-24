import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class LookupTableModel extends SimNodeModel {

    kind = 'lookupTable'
    lookupTable = [[10,20],[15, 22], [18,33]]

    constructor(options = {}, lookupTable = []) {
        super({...options, name: 'lookupTable'});

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
            // Find the nearest value in the lookup table
            let closest = this.lookupTable[0];
            let minDiff = Math.abs(inputValue - closest[0]);
            for (let i = 1; i < this.lookupTable.length; i++) {
                const diff = Math.abs(inputValue - this.lookupTable[i][0]);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = this.lookupTable[i];
                }
            }
            return {'out': closest[1]};
        }
        return {'out': NaN};
    }

    reset(){
        super.reset();
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <text x="4" y="15" fontFamily="Arial" fontSize="9" fill="#000000">LUT</text>
    </svg>

    settings = _ => {

        const isNumberArray = (arr) => {
            return arr.every(pair => Array.isArray(pair) && pair.length === 2 && !isNaN(Number(pair[0])) && !isNaN(Number(pair[1])));
        }

        // Internal editor
        const ControlEditor = () => {

            const [getTable, setTable] = useState(JSON.stringify(this.lookupTable));
            const [getError, setError] = useState(false);

            useEffect(()=>{
                try {
                    const parsedTable = JSON.parse(getTable);
                    if (isNumberArray(parsedTable)) {
                        setError(false)
                        this.lookupTable = parsedTable;
                        this.component && this.component.forceUpdate();
                    }
                } catch (e) {
                    setError(true)
                }
            }, [getTable]);

            return <div>
                <p>This block uses a lookup table to determine the output based on the input value.</p>
                <p>The method used is the closest point (no interpolation).</p>
                <p>Table must be pased in following format: [[x1,y1], [x2,y2], ...]</p>
                { getError && <p className='danger'>Invalid lookup table format</p>}
                <InputGroup label={ 'Table' }  value={ getTable } setValue={ e => setTable(e) } />
            </div>
        }

        useModal.configure(this, 'Lookup Table Block', <ControlEditor />, true);

    }
    
}

export default LookupTableModel
