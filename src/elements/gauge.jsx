import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import Gauge from './complements/Gauge';
import { InputGroup } from '../components/inputGroup';

class GaugeModel extends SimNodeModel {
    kind = 'gauge';
    isTerminalBlock = true;
    value = 0;
    minValue = 0;
    maxValue = 100;
    CGenUID = 'gau';
    tags = ['gauge', 'display', 'value', 'indicator', 'meter'];

    constructor(options = {}) {
        super({ ...options, name: 'gauge' });
        this.createPort('in', true);
        this.value = 0;
        this.component = null;
    }

    // Main function of the block
    solution() {
        const inpt = this.getNodeByInput(0);
        if (inpt && inpt.solve) {
            this.value = inpt.solve();
            this.update()
        }
        return this.value;
    }

    reset() {
        super.reset();
        this.value = 0;
    }

    icon = () => {
        if (Simulation.getCurrentStep() > 0 && this.component) {
            return (
                <Gauge
                    value={this.value}
                    minValue={this.minValue}
                    maxValue={this.maxValue}
                    width={200}
                    height={200}
                />

            );
        }

        // Return the default icon
        return (
            <svg width="32" height="32" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.303" d="M73 254C70 208 116 156 156 136C166 131 181 129 192 128C255 123 326 185 326 249" stroke="#000" strokeOpacity="0.9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M73 254C70 208 116 156 156 136C166 131 181 129 192 128C222 126 254 139 279 160" stroke="#000" strokeOpacity="0.9" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M186 242C189 240 193 239 197 239C215 243 218 268 198 272C182 276 169 255 180 244" stroke="#000" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M186 237C211 220 231 197 254 178C255 176 264 167 265 169C274 175 215 255 208 267" stroke="#000" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M196 129C198 135 198 141 198 146" stroke="#000" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M101 216C97 214 94 212 89 209" stroke="#000" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M307 207C306 207 302 209 298 212L307 207Z" stroke="#000" strokeOpacity="0.9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    settings = _ => {
        const ControlEditor = () => {
            const [minValue, setMinValue] = useState(this.minValue);
            const [maxValue, setMaxValue] = useState(this.maxValue);

            useEffect(() => {
                this.minValue = minValue;
                this.maxValue = maxValue;
                this.component && this.component.forceUpdate();
            }, [minValue, maxValue]);

            return (
                <div>
                    <p>This block displays the input value as a gauge.</p>
                    <InputGroup label="Min Value" value={minValue} setValue={e => setMinValue(Number(e))} />
                    <InputGroup label="Max Value" value={maxValue} setValue={e => setMaxValue(Number(e))} />
                </div>
            );
        }

        useModal.configure(this, 'Gauge Block', <ControlEditor />, true);
    }
}

export default GaugeModel;
