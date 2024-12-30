import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { toast } from 'react-toastify';
const generateSampleCSV = () => {
  const sampleData = `Time,Sensor1,Sensor2,Sensor3\n0,10.5,20.1,5.0\n1,12.3,21.5,5.5\n2,14.8,19.8,5.7\n3,15.0,18.6,6.0\n4,16.5,22.0,6.2`;
  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

class ImportCSVModel extends SimNodeModel {
  kind = 'csvImport';
  isTerminalBlock = false;
  mapValues = new Map();
  columnNames = [];
  CGenUID = 'csvImp';
  tags = ['csv', 'data', 'inport', 'load', 'sheet', 'excel', 'import', 'file', 'parser', 'columns', 'rows', 'values'];

  constructor(options = {}) {
    super({ ...options, name: 'Import CSV' });
    this.mapValues = new Map();

    this.loadCSV = this.loadCSV.bind(this);
    this.reset = this.reset.bind(this);
    this.buildOutputs = this.buildOutputs.bind(this);
    this.solution = this.solution.bind(this);
  }

  // Load CSV file and generate output ports
  loadCSV(file, setColumns) {

    if (!file.name.endsWith('.csv')) {
      toast.warning('Please upload a valid CSV file.', {autoClose: false})
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = event.target.result.split('\n').map((row) => row.split(','));

      if(!rows[0].includes("Time")){
        toast.warning('Your CSV must have a column named "Time".', {autoClose: false})
        return
      }

      // Create a map with column names and values
      this.columnNames = rows[0];
      this.columnNames.map(colName => {
        const valArr = []
        rows.slice(1).map((row) => row.map((value, index) => {
          if (rows[0][index] === colName) {
            if (!isNaN(parseFloat(value))) {
              valArr.push(parseFloat(value))
            }
          }
        }));
        this.mapValues.set(colName, valArr);
      })

      setColumns([...this.columnNames]);
      this.buildOutputs()

    };
    reader.readAsText(file);
  };


  buildOutputs() {
    const outports = this.getOutPorts();
    outports.filter(outp => !this.columnNames.includes(outp.options.name)).forEach(outp => this.removePort(outp));
    this.columnNames
      .filter((name) => !outports.some(outp => outp.options.name === name))
      .forEach((name) => {
        this.createPort(name, false);
      });
    if (this.component) {
      this.component.forceUpdate();
    }

  }


  // Main function of the block
  solution() {
    const currentTime = Simulation.getCurrentTime();
    if (!this.columnNames.includes('Time')) {
      throw new Error('The CSV must include a Time column.');
    }
    
    const time = this.mapValues.get('Time');
    let timeIndex = time.findIndex(t => t > currentTime) - 1;
    timeIndex = timeIndex < -1? time.length - 1 : Math.max(0,timeIndex);

    const outputs = {};
    this.columnNames.forEach((name) => {
      outputs[name] = this.mapValues.get(name)[timeIndex];
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

      const [columns, setColumns] = useState([]);

      const handleFileChange = (event) => {
        this.loadCSV(event.target.files[0], setColumns)
      };

      return (
        <div>
          <p>This block imports values from a CSV file. Each column generates an output port.</p>
          <p>You must have a column named "Time" in your CSV file</p>
          <div className='flex'>
          <input type="file" accept=".csv" className="btn-professional btn-sm" onChange={handleFileChange} />
          {!columns.length && <button className="btn-professional btn-sm" onClick={generateSampleCSV}>Get a sample CSV</button>}
          </div>
          {columns.length > 0 && (
            <div>
              <h4>Generated Output Ports:</h4>
              <ul>
                {columns.map((name, index) => (
                  <li key={index}>{`Output ${index + 1}: ${name}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };

    useModal.configure(this, 'Import CSV Block', <ControlEditor />, true);
  };

  serialize() {
    const data = super.serialize();
    return {
      ...data,
      columnNames: this.columnNames,
      mapValues: Array.from(this.mapValues.entries())
    };
  }

  deserialize(event) {
    this.columnNames = event.data.columnNames || [];
    this.mapValues = new Map(event.data.mapValues || []);
  }

}

export default ImportCSVModel;
