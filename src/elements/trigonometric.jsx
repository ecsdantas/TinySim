import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import { SelectGroup } from '../components/inputGroup';

class TrigonometricModel extends SimNodeModel {
  kind = 'trigonometric';
  functionType = 'sin'; // Default function
  value = 0;
  CGenUID = 'trig';
  tags = ['sine', 'cosine', 'tangente', 'arc', 'hyperbolic', 'angle', 'trigonometric'];


  constructor(options = {}) {
    super({ ...options, name: 'trigonometric' });
    this.createPort('in', true);
    this.createPort('out', false);
    this.value = 0;
    this.component = null;
  }

  // Main function of the block
  solution() {
    const inpt = this.getNodeByInput(0);
    let result = 0;
    if (inpt && inpt.solve) {
      const inputValue = inpt.solve();
      switch (this.functionType) {
        case 'sin':
          result = Math.sin(inputValue);
          break;
        case 'cos':
          result = Math.cos(inputValue);
          break;
        case 'tan':
          result = Math.tan(inputValue);
          break;
        case 'asin':
          result = Math.asin(inputValue);
          break;
        case 'acos':
          result = Math.acos(inputValue);
          break;
        case 'atan':
          result = Math.atan(inputValue);
          break;
        case 'sinh':
          result = Math.sinh(inputValue);
          break;
        case 'cosh':
          result = Math.cosh(inputValue);
          break;
        case 'tanh':
          result = Math.tanh(inputValue);
          break;
        case 'asinh':
          result = Math.asinh(inputValue);
          break;
        case 'acosh':
          result = Math.acosh(inputValue);
          break;
        case 'atanh':
          result = Math.atanh(inputValue);
          break;
        default:
          result = Math.sin(inputValue);
          break;
      }
      this.value = result;
    }
    return { 'out': this.value };
  }

  reset() {
    super.reset();
    this.value = 0;
  }

  icon = () => {
    const functionText = this.functionType.toUpperCase();
    return (
      <svg width="48" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="44" height="20" stroke="#000000" strokeWidth="1" />
        <text x="24" y="16" fontFamily="Arial" fontSize="9" fill="#000000" textAnchor='middle'>{functionText}()</text>
      </svg>
    );
  }

  settings = _ => {
    const ControlEditor = () => {
      const [functionType, setFunctionType] = useState(this.functionType);

      useEffect(() => {
        this.functionType = functionType;
        this.component && this.component.forceUpdate();
      }, [functionType]);

      return (
        <div>
          <p>This block computes the trigonometric function of the input value. Angles in radian.</p>
          <SelectGroup
            label="Function"
            value={functionType}
            setValue={e => setFunctionType(e)}
            options={[
              { value: 'sin', label: 'sin' },
              { value: 'cos', label: 'cos' },
              { value: 'tan', label: 'tan' },
              { value: 'asin', label: 'asin' },
              { value: 'acos', label: 'acos' },
              { value: 'atan', label: 'atan' },
              { value: 'sinh', label: 'sinh' },
              { value: 'cosh', label: 'cosh' },
              { value: 'tanh', label: 'tanh' },
              { value: 'asinh', label: 'asinh' },
              { value: 'acosh', label: 'acosh' },
              { value: 'atanh', label: 'atanh' },
            ]}
          />
        </div>
      );
    }

    useModal.configure(this, 'Trigonometric Block', <ControlEditor />, true);
  }

  serialize() {
    const data = super.serialize();
    return {
        ...data,
        functionType: this.functionType
    };
  }

  deserialize(event) {
      super.deserialize(event);
      this.functionType = event.data.functionType;
  }

}

export default TrigonometricModel;
