import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel'
import { useModal } from '../components/modal';
import { InputGroup, SelectGroup } from '../components/inputGroup';

class RandomNumberModel extends SimNodeModel {

    kind = 'randomNumber'
    minValue = 0
    maxValue = 1
    distribution = 'uniform'

    constructor(options = {}, minValue = 0, maxValue = 1, distribution = 'uniform') {
        super({...options, name: 'randomNumber'});

        // Define the initial parameters
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.distribution = distribution;
        
        // Create the ports of random number model
        this.createPort('out', false);
    }

    // Main function of the block
    solution() {
        const min = this.minValue;
        const max = this.maxValue;
        if (this.distribution === 'uniform') {
            return Math.random() * (max - min) + min;
        } else if (this.distribution === 'normal') {
            let u = 0, v = 0;
            while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
            while(v === 0) v = Math.random();
            const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const mean = (max + min) / 2;
            const stdDev = (max - min) / 6; // 99.7% of values lie within +/- 3 std dev for normal distribution
            return num * stdDev + mean;
        }
        return NaN;
    }

    reset(){
        super.reset();
    }

    icon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
        <text x="5" y="15" fontFamily="Arial" fontSize="8" fill="#000000">Rnd</text>
    </svg>

    settings = _ => {

        const isNumber = (n) => {
            return !isNaN(Number(n));
        }

        // Internal editor
        const ControlEditor = () => {

            const [getMinValue, setMinValue] = useState(this.minValue);
            const [getMaxValue, setMaxValue] = useState(this.maxValue);
            const [getDistribution, setDistribution] = useState(this.distribution);

            useEffect(() => {
                if (isNumber(getMinValue)) {
                    this.minValue = Number(getMinValue);
                    this.component && this.component.forceUpdate();
                }
            }, [getMinValue]);

            useEffect(() => {
                if (isNumber(getMaxValue)) {
                    this.maxValue = Number(getMaxValue);
                    this.component && this.component.forceUpdate();
                }
            }, [getMaxValue]);

            useEffect(() => {
                this.distribution = getDistribution;
                this.component && this.component.forceUpdate();
            }, [getDistribution]);

            return <div>
                <p>This block generates a random number based on the specified minimum and maximum values, and the distribution type.</p>
                <InputGroup label={'Minimum Value'} value={getMinValue} setValue={e => setMinValue(e)} />
                <InputGroup label={'Maximum Value'} value={getMaxValue} setValue={e => setMaxValue(e)} />
                <SelectGroup label={'Distribution'} value={getDistribution} setValue={e => setDistribution(e)} options={['uniform', 'normal']} />
            </div>
        }

        useModal.configure(this, 'Random Number Block', <ControlEditor />, true);

    }
    
}

export default RandomNumberModel
