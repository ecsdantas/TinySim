import React, { useState } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';

class ImportCSVModel extends SimNodeModel {
  kind = 'csvImport';
  isTerminalBlock = false;
  values = [];
  columnNames = [];

  constructor(options = {}) {
    super({ ...options, name: 'Import CSV' });
    this.values = [];
    this.columnNames = [];
    this.component = null;
  }

  // Load CSV file and generate output ports
  loadCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.split(','));

      // Extract column names from the first row
      this.columnNames = rows[0];
      this.values = rows.slice(1).map(row => row.map(value => parseFloat(value)));

      // Create output ports
      this.columnNames.forEach((name, index) => {
        this.createPort(`out${index + 1}`, false);
      });

      if (this.component) {
        this.component.forceUpdate();
      }
    };
    reader.readAsText(file);
  }

  // Main function of the block
  solution() {
    const currentTime = Simulation.getCurrentStep();
    const colValues = this.values[currentTime] || [];
    const outputs = {};

    colValues.forEach((value, index) => {
      outputs[`out${index + 1}`] = value;
    });

    return outputs;
  }

  icon = () => (
    <svg viewBox="0 0 300 400" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#008000" strokeWidth="5" width="300" height="400" x="0" y="0" ry="8" />
      <rect fill="#FFFFFF" strokeWidth="18" width="260" height="360" x="20" y="20" ry="0" />
      <rect fill="#99cd43" width="260" height="90" x="20" y="292" ry="0" />
      <path fill="#004433" d="m 150,75 -55,55 v 35 L 140,120 v 120 c 0,12 18,12 18,0 V 120 l 46,45 V 130 Z" />
      <text x="75" y="366" fontSize="85">CSV</text>
    </svg>
  );

  settings = _ => {
    const ControlEditor = () => {
      const [file, setFile] = useState(null);

      const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        this.loadCSV(selectedFile);
      }

      return (
        <div>
          <p>This block imports values from a CSV file. Each column generates an output port.</p>
          <input type="file" accept=".csv" className='btn' onChange={handleFileChange} />
          {this.columnNames.length > 0 && (
            <div>
              <h4>Generated Output Ports:</h4>
              {this.columnNames.map((name, index) => (
                <p key={index}>{`Output ${index + 1}: ${name}`}</p>
              ))}
            </div>
          )}
        </div>
      );
    }

    useModal.configure(this, 'Import CSV Block', <ControlEditor />, true);
  }
}

export default ImportCSVModel;
