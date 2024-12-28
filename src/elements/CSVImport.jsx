import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';


// BUG AO IMPORTAR, ELE PARA DE FUNCIONAR
class ImportCSVModel extends SimNodeModel {
  kind = 'csvImport';
  isTerminalBlock = false;
  mapValues = new Map();
  values = [];
  columnNames = [];
  CGenUID = 'csvImp';
  tags = ['csv', 'data', 'inport', 'excel'];

  constructor(options = {}) {
    super({ ...options, name: 'Import CSV' });
    this.values = [];
    this.columnNames = [];
    this.component = null;
  }

  // Load CSV file and generate output ports
  loadCSV = (file, setColumnNames) => {
    this.reset()
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map((row) => row.split(','));

      // Extract column names from the first row
      this.columnNames = rows[0];
      setColumnNames(this.columnNames);
      this.values = rows.slice(1).map((row) => row.map((value) => parseFloat(value)));
      
      // Create a map with column names and values
      this.columnNames.map(colName => {
        const valArr = []
        rows.slice(1).map((row) => row.map((value,index) => {
          if (rows[0][index] === colName) {
            if(!isNaN(parseFloat(value))){
              valArr.push(parseFloat(value))
            }
          }
        }));
        this.mapValues.set(colName,  valArr);
      })

      const outports = this.getOutPorts();
      outports.filter(outp => !this.columnNames.includes(outp.options.name)).forEach(outp => this.removePort(outp))
    
      // Create output ports with column names
      this.columnNames
        .filter((name) => !outports.some(outp => outp.options.name === name))
        .forEach((name) => {
          this.createPort(name, false);
      });

      if (this.component) {
        this.component.forceUpdate();
      }
    };
    reader.readAsText(file);
  };

  reset(){
    super.reset()
    this.values = [];
    this.columnNames = [];
    this.component = null;
  }


  // Main function of the block
  solution() {
    const currentTime = Simulation.getCurrentTime();
    const timeColumnIndex = this.columnNames.indexOf('Time');

    if (timeColumnIndex === -1) {
      throw new Error('The CSV must include a Time column.');
    }

    // Find the closest previous or equal time value
    const times = this.values.map(row => row[timeColumnIndex]);
    let closestIndex = -1;
    for (let i = 0; i < times.length; i++) {
      if (times[i] <= currentTime) {
        closestIndex = i;
      } else {
        break;
      }
    }

    // If no previous value exists, use the first row
    if (closestIndex === -1) {
      closestIndex = 0;
    }

    const colValues = this.values[closestIndex] || [];
    const outputs = {};

    colValues.forEach((value, index) => {
      const portName = this.columnNames[index];
      outputs[portName] = value;
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
      const [columnNames, setColumnNames] = useState([]);

      useEffect(() => {
        setColumnNames(this.columnNames);
      }, [this.columnNames]);

      const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        this.loadCSV(selectedFile, setColumnNames);
      };

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

      return (
        <div>
          <p>This block imports values from a CSV file. Each column generates an output port.</p>
          <input type="file" accept=".csv" className="btn" onChange={handleFileChange} />
          { !columnNames.length && <button className="btn" onClick={generateSampleCSV}>Get a sample CSV</button> }
          {columnNames.length > 0 && (
            <div>
              <h4>Generated Output Ports:</h4>
              <ul>
                {columnNames.map((name, index) => (
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
      values: this.values,
      columnNames: this.columnNames,
      mapValues: this.mapValues
    };
  }

  deserialize(event) {
    this.reset()
    super.deserialize(event);
    //this.mapValues = event.data.mapValues || new Map();
    this.values = event.data.values || [];
    this.columnNames = event.data.columnNames || [];
  }
}

export default ImportCSVModel;
