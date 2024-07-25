import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class TransferFunctionModel extends SimNodeModel {
  kind = 'transferFunction';
  isTerminalBlock = false;
  numerator = [1];
  denominator = [1,0];
  pastInputs = [];
  pastOutputs = [];
  integral = 0;

  constructor(options = {}, numerator = [1], denominator = [1,0]) {
    super({ ...options, name: 'Transfer Function' });
    this.createPort('in', true);
    this.createPort('out', false);
    this.numerator = numerator;
    this.denominator = denominator;
  }

  // Main function of the block
  solution() {
    const inpt = this.getNodeByInput(0);
    const currentStep = Simulation.getCurrentStep();
    const deltaTime = Simulation.getStepTime();

    if (inpt && inpt.solve) {
      const input = inpt.solve();

      // Handle the 1/s (integrator) case specifically
      if (this.denominator.length === 2 && this.denominator[0] === 1 && this.denominator[1] === 0) {
        this.integral += input * deltaTime;
        return { 'out': this.integral };
      }

      // Store the current input
      this.pastInputs.push(input);
      if (this.pastInputs.length > this.denominator.length) {
        this.pastInputs.shift(); // Maintain the correct number of past inputs
      }

      // Compute the output using the difference equation
      let output = 0;
      for (let i = 0; i < this.numerator.length; i++) {
        if (i < this.pastInputs.length) {
          output += this.numerator[i] * this.pastInputs[this.pastInputs.length - 1 - i];
        }
      }
      for (let i = 1; i < this.denominator.length; i++) {
        if (i < this.pastOutputs.length) {
          output -= this.denominator[i] * this.pastOutputs[this.pastOutputs.length - i];
        }
      }
      output /= this.denominator[0];

      // Store the current output
      this.pastOutputs.push(output);
      if (this.pastOutputs.length > this.denominator.length) {
        this.pastOutputs.shift(); // Maintain the correct number of past outputs
      }

      // Return the output considering the initial condition
      return { 'out': currentStep === 0 ? 0 : output };
    }

    return { 'out': 0 };
  }

  reset() {
    super.reset();
    this.pastInputs = [];
    this.pastOutputs = [];
    this.integral = 0;
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
          this.component && this.component.forceUpdate();
        } catch (error) {
          console.error('Invalid input:', error);
        }
      }, [numerator, denominator]);

      return (
        <div>
          <p>This block implements a transfer function in the Laplace domain.</p>
          <InputGroup label="Numerator" value={numerator} setValue={e => setNumerator(e)} />
          <InputGroup label="Denominator" value={denominator} setValue={e => setDenominator(e)} />
        </div>
      );
    }

    useModal.configure(this, 'Transfer Function Block', <ControlEditor />, true);
  }
}

export default TransferFunctionModel;
