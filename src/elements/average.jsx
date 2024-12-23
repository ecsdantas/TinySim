import React from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';

class AverageModel extends SimNodeModel {
  kind = 'average';
  values = [];
  CGenUID = 'avg';
  tags = ['avg', 'mean', 'average', 'media'];


  constructor(options = {}) {
    super({ ...options, name: 'Average' });
    this.createPort('in1', true);
    this.createPort('in2', true);
    this.createPort('out', false);
    this.values = [];
    this.component = null;
  }

  // Main function of the block
  solution() {
    const ports = this.getInPorts();
    let sum = 0;
    let count = 0;

    ports.forEach((port, index) => {
      const inpt = this.getNodeByInput(index);
      if (inpt && inpt.solve) {
        sum += inpt.solve();
        count++;
      }
    });

    const avg = count > 0 ? sum / count : 0;
    this.values.push(avg);
    return { 'out': avg };
  }

  reset() {
    super.reset();
    this.values = [];
  }

  icon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
      <text x="6" y="16" fontFamily="Arial" fontSize="12" fill="#000000">x̄</text>
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
          <p>This block calculates the average of the input values.</p>
          <button className='btn' onClick={AddPorts}>Add port</button>
        </div>
      );
    }

    useModal.configure(this, 'Average Block', <ControlEditor />, true);
  }
}

export default AverageModel;
