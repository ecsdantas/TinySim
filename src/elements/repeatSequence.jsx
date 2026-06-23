import React, { useEffect, useState } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
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
    // Indexes by step count (always an integer) rather than simulation time,
    // which is fractional for non-integer step sizes and would index the
    // array with a non-integer value.
    const index = Simulation.getCurrentStep() % this.sequence.length;
    return { 'out': this.sequence[index] };
  }

  icon = () => (
    <svg width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="62" height="30" stroke="#000000" strokeWidth="1" />
      <polyline points="8,24 16,8 24,24 32,8 40,24 48,8 56,24" stroke="#000000" strokeWidth="1" fill="none" />
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
          <p>This block generates a repeating sequence of values.<br />
            <span>Values must be separated by commas.</span>
          </p>
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
    super.deserialize(event);
    this.sequence = event.data.sequence || [];
  }
}

export default RepeatingSequenceModel;