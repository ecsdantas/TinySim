import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';
import * as ControlSystems from 'control-systems-js';

class TransferFunctionModel extends SimNodeModel {
  kind = 'transferFunction';
  numerator = [1];
  denominator = [1, 0];
  values = [];
  times = [];
  
  constructor(options = {}, numerator = [1], denominator = [1, 0]) {
    super({ ...options, name: 'Transfer Function' });
    this.createPort('in', true);
    this.createPort('out', false);
    this.numerator = numerator;
    this.denominator = denominator;
    this.tf = ControlSystems.transferFunction({
      numerator: this.numerator,
      denominator: this.denominator,
    });
  }

  // Main function of the block
  solution() {
    const inpt = this.getNodeByInput(0);
    if (inpt && inpt.solve) {
      this.times.push(Simulation.getCurrentTime());
      this.values.push(inpt.solve());
      const stepResult = this.tf.step(this.times, { input: this.values });
      return { 'out': stepResult[stepResult.length - 1].y };
    }
    return { 'out': 0 };
  }

  reset() {
    super.reset();
    this.times = [];
    this.values = [];
    this.tf = ControlSystems.transferFunction({
      numerator: this.numerator,
      denominator: this.denominator,
    });
  }

  generateEquationText() {
    const formatPolynomial = (coefficients) => {
      return coefficients.map((coef, index) => {
        const power = coefficients.length - 1 - index;
        if (power === 0) return `${coef}`;
        if (power === 1) return `${coef}s`;
        return `${coef}s^${power}`;
      }).join(' + ');
    };
    const numeratorText = formatPolynomial(this.numerator);
    const denominatorText = formatPolynomial(this.denominator);
    return { numeratorText, denominatorText };
  }

  icon = () => {
    const { numeratorText, denominatorText } = this.generateEquationText();
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="60" height="60" stroke="#000000" strokeWidth="1" />
        <text x="4" y="20" fontFamily="Arial" fontSize="8" fill="#000000">{numeratorText}</text>
        <line x1="4" x2="60" y1="24" y2="24" stroke="#000000" strokeWidth="1" />
        <text x="4" y="38" fontFamily="Arial" fontSize="8" fill="#000000">{denominatorText}</text>
      </svg>
    );
  };

  settings = _ => {
    const ControlEditor = () => {
      const [numerator, setNumerator] = useState(JSON.stringify(this.numerator));
      const [denominator, setDenominator] = useState(JSON.stringify(this.denominator));

      useEffect(() => {
        try {
          this.numerator = JSON.parse(numerator);
          this.denominator = JSON.parse(denominator);
          this.tf = ControlSystems.transferFunction({
            numerator: this.numerator,
            denominator: this.denominator,
          });
          this.component && this.component.forceUpdate();
        } catch (error) {
          console.error('Invalid input:', error);
        }
      }, [numerator, denominator]);

      return (
        <div>
          <p>This block implements a transfer function in the Laplace domain. This model uses: <a href="https://github.com/Brenopms/control-systems-js" target='_blank'>control-systems-js</a>.</p>
          <InputGroup label="Numerator" value={numerator} setValue={e => setNumerator(e)} />
          <InputGroup label="Denominator" value={denominator} setValue={e => setDenominator(e)} />
        </div>
      );
    }

    useModal.configure(this, 'Transfer Function Block', <ControlEditor />, true);
  }
}

export default TransferFunctionModel;
