import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel'
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class SaturationModel extends SimNodeModel {

    kind = 'saturation'
    CGenUID = 'sat';
    tags = ['saturation', 'limit', 'max','min'];


    constructor(options = {}) {
        super({ ...options, name: 'saturation' });

        // Create the ports of saturation model
        this.createPort('out', false);
        this.createPort('in', true);

        // Internal parameters
        this.MaxValue = options.MaxValue || 10;
        this.MinValue = options.MinValue || 0;
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0)
        if (inpt && inpt.solve) {
            const value = inpt.solve();
            return {'out': Math.max(this.MinValue, Math.min(this.MaxValue, value)) };
        }
        return {'out': 0}
    }

    icon = () => <svg width={32} height={32} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth={1} />
        <line x1="12" y1="7" x2="20" y2="7" stroke="#000000" strokeWidth={1} />
        <line x1="4" y1="17" x2="12" y2="17" stroke="#000000" strokeWidth={1} />
        <line x1="12" y1="7" x2="12" y2="17" stroke="#000000" strokeWidth={1} />
    </svg>

    settings = _ => {
        
        // Editor interno
        const ControlEditor = () => {

            const [maxValue, setMaxValue] = useState(this.MaxValue);
            const [minValue, setMinValue] = useState(this.MinValue);

            useEffect(()=>{
                this.MaxValue = parseFloat(maxValue) ?? 10
                this.MinValue = parseFloat(minValue) ?? 10
            },[maxValue, minValue])

            return <div>
                <p>This block constrains the output values between MinValue and MaxValue.</p>
                <InputGroup label={ 'Max value'}  value={ maxValue } setValue={ e => setMaxValue(e) } />
                <InputGroup label={ 'Min value'}  value={ minValue } setValue={ e => setMinValue(e) } />
            </div>
        }

        useModal.configure(this, 'Saturation Block', <ControlEditor />, true);
    }

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            MaxValue: this.MaxValue,
            MinValue: this.MinValue,
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.MaxValue = event.data.MaxValue;
        this.MinValue = event.data.MinValue;
    }
}

export default SaturationModel
