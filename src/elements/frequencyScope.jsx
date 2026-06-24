import React, { useState } from 'react';
import { transferFunction } from 'control-systems-js';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';
import { trimLeadingZeros, logSpace, LinearizationError } from '../simulation/transferFunctionMath';
import BodeChart from './complements/BodeChart';

// Static frequency-response (Bode) analysis of the dynamic chain feeding
// this block's input. Unlike Plot/Display, it does not run during the
// time-domain simulation loop (isTerminalBlock stays false): `analyze()`
// walks the diagram once, on demand, via `linearize()` (see
// nodes/nodes/simNodeModel.jsx and elements/variadicMathModel.jsx for the
// per-block Laplace transfer functions this composes).
class FrequencyScopeModel extends SimNodeModel {
    kind = 'frequencyScope';
    isTerminalBlock = false;
    CGenUID = 'freq';
    tags = ['bode', 'frequency', 'frequency response', 'scope', 'analysis', 'magnitude', 'phase', 'control systems', 'laplace', 'transfer function'];

    minFrequency = 0.01;
    maxFrequency = 1000;
    numPoints = 200;
    bodeData = null;
    tfString = null;
    errorMessage = null;

    constructor(options = {}) {
        super({ ...options, name: 'frequencyScope' });
        this.createPort('in', true);
    }

    analyze() {
        this.errorMessage = null;
        this.bodeData = null;
        this.tfString = null;

        const inputNode = this.getNodeByInput(0);
        if (!inputNode) {
            this.errorMessage = 'Connect a block to the input port before analyzing.';
            this.update();
            return;
        }

        try {
            const expr = inputNode.linearize();
            const numerator = trimLeadingZeros(expr.numerator);
            const denominator = trimLeadingZeros(expr.denominator);
            const tf = transferFunction({ numerator, denominator });
            const frequencies = logSpace(this.minFrequency, this.maxFrequency, this.numPoints);
            this.bodeData = tf.bode(frequencies);
            this.tfString = tf.toString();
        } catch (error) {
            this.errorMessage = error instanceof LinearizationError
                ? error.message
                : `Unable to compute a transfer function for this diagram: ${error.message}`;
        }

        this.update();
    }

    // Não participa do loop de tempo: a análise é estática, sob demanda.
    solution() {
        return { out: 0 };
    }

    reset() {
        super.reset();
    }

    icon = () => {
        if (this.bodeData && this.component) {
            return <BodeChart magnitude={this.bodeData.magnitude} phase={this.bodeData.phase} plotWidth={260} plotHeight={120} />;
        }
        return (
            <svg width="100" height="60" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="100%" height="100%" fill="#000000" />
                <path style={{ stroke: '#4bc0c0', fill: 'none', strokeWidth: 2 }} d="M 5,15 H 30 C 45,15 45,45 60,45 H 95" />
                <path style={{ stroke: '#b3b3b3', fill: 'none', strokeWidth: 1, opacity: 0.5 }} d="M 5,30 H 95" />
            </svg>
        );
    };

    settings = () => {
        const ControlEditor = () => {
            const [minFrequency, setMinFrequency] = useState(this.minFrequency);
            const [maxFrequency, setMaxFrequency] = useState(this.maxFrequency);
            const [, forceUpdate] = useState(0);

            const runAnalysis = () => {
                this.minFrequency = Number(minFrequency) || this.minFrequency;
                this.maxFrequency = Number(maxFrequency) || this.maxFrequency;
                this.analyze();
                forceUpdate((n) => n + 1);
            };

            return (
                <div>
                    <p>Computes the Bode plot (magnitude/phase vs. frequency) of the chain of dynamic blocks feeding this scope. Supports Gain, Integrator, Derivator/FirstOrder, ZeroOrder, Add/Sub and PI control (PID without the derivative term).</p>
                    <InputGroup label="Min Frequency" value={minFrequency} setValue={setMinFrequency} unit="rad/s" />
                    <InputGroup label="Max Frequency" value={maxFrequency} setValue={setMaxFrequency} unit="rad/s" />
                    <button className="btn" onClick={runAnalysis}>Analyze</button>
                    {this.errorMessage && <p style={{ color: '#e74c3c' }}>{this.errorMessage}</p>}
                    {this.tfString && <p>H(s) = {this.tfString}</p>}
                    {this.bodeData && <BodeChart magnitude={this.bodeData.magnitude} phase={this.bodeData.phase} />}
                </div>
            );
        };

        useModal.configure(this, 'Frequency Scope Block', <ControlEditor />, true);
    };

    serialize() {
        const data = super.serialize();
        return {
            ...data,
            minFrequency: this.minFrequency,
            maxFrequency: this.maxFrequency,
            numPoints: this.numPoints,
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.minFrequency = event.data.minFrequency || 0.01;
        this.maxFrequency = event.data.maxFrequency || 1000;
        this.numPoints = event.data.numPoints || 200;
    }
}

export default FrequencyScopeModel;
