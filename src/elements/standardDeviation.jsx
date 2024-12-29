import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';

class StandardDeviationModel extends SimNodeModel {
  kind = 'deviation';
  values = [];
  CGenUID = 'std';
  tags = ['standard', 'deviation', 'average', 'media', 'statistics', 'math', 'calculation', 'data', 'analysis', 'variance', 'spread', 'distribution'];


  constructor(options = {}) {
    super({ ...options, name: 'Standard Deviation' });
    this.createPort('in1', true);
    this.createPort('in2', true);
    this.createPort('out', false);
    this.values = [];
    this.component = null;
  }

  // Main function of the block
  solution() {
    const ports = this.getInPorts();
    const values = [];

    ports.forEach((port, index) => {
      const inpt = this.getNodeByInput(index);
      if (inpt && inpt.solve) {
        values.push(inpt.solve());
      }
    });

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    this.values.push(stdDev);
    return { 'out': stdDev };
  }

  reset() {
    super.reset();
    this.values = [];
  }

  icon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
      <text x="4" y="16" fontFamily="Arial" fontSize="10" fill="#000000">±</text>
    </svg>
  );

  settings = _ => {
    const ControlEditor = () => {
      const AddPorts = () => {
        const portCount = this.getInPorts().length + 1;
        this.createPort(`in${portCount}`, true);
        this.component && this.component.forceUpdate();
      }

      return (
        <div>
          <p>This block calculates the standard deviation of the input values.</p>
          <button className='btn' onClick={AddPorts}>Add port</button>
        </div>
      );
    }

    useModal.configure(this, 'Standard Deviation Block', <ControlEditor />, true);
  }
}

export default StandardDeviationModel;
