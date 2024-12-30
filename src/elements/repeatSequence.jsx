import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import { InputGroup } from '../components/inputGroup';
import Simulation from '../simulation/core';

class RepeatingSequenceModel extends SimNodeModel {
  kind = 'repeatingSequence';
  isTerminalBlock = false;
  sequence;
  CGenUID = 'repSeq';
  tags = ['sequence', 'repeating', 'signal', 'generator'];

  constructor(options = {}) {
    super({ ...options, name: 'Repeating Sequence' });
    this.sequence = options.sequence || [1, 2, 3, 4];

    // Create the ports of add model
   this.createPort('out', false);

   this.solution = this.solution.bind(this);

  }

  // Main function of the block
  solution() {
    const currentTime = Simulation.getCurrentTime();
    const index = currentTime % this.sequence.length;
    return { 'out': this.sequence[index] };
  }

  icon = () => (
    <svg viewBox="0 0 64 64" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#4CAF50" />
      <path fill="#FFFFFF" d="M 20,32 A 1,1 0 0,1 32,20 A 1,1 0 0,1 44,32 A 1,1 0 0,1 32,44 A 1,1 0 0,1 20,32 M 28,32 A 1,1 0 0,0 32,28 A 1,1 0 0,0 36,32 A 1,1 0 0,0 32,36 A 1,1 0 0,0 28,32" />
      <path fill="#FFFFFF" d="M 32,10 L 32,20 M 32,44 L 32,54 M 10,32 L 20,32 M 44,32 L 54,32" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );

  settings = _ => {
    const ControlEditor = () => {
      const [sequence, setSequence] = useState(this.sequence.join(', '));

      useEffect(() => {
        if (sequence) {
          const seq = sequence.split(',').map(e => parseFloat(e.trim()));
          if (seq.every(e => !isNaN(e))) {
            this.sequence = seq;
            this.component && this.component.forceUpdate();
          }
        }
      }, [sequence])

      return (
        <div>
          <p>This block generates a repeating sequence of values.</p>
          <InputGroup label="Sequence" value={sequence} setValue={ e => setSequence(e) } />
        </div>
      );
    };

    useModal.configure(this, 'Repeating Sequence Block', <ControlEditor />, true);
  };

  serialize() {
    const data = super.serialize();
    return {
      ...data,
      sequence: this.sequence
    };
  }

  deserialize(event) {
    this.sequence = event.data.sequence || [];
  }
}

export default RepeatingSequenceModel;