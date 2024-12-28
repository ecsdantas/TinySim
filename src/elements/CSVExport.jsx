import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class ExportCSVModel extends SimNodeModel {
  kind = 'csvExport';
  isTerminalBlock = true;
  mapValues = new Map();
  columnNames = [];
  CGenUID = 'csvExp';
  tags = ['csv', 'data', 'export', 'save', 'sheet', 'excel', 'download', 'file', 'spreadsheet', 'output', 'report'];

  constructor(options = {}) {
    super({ ...options, name: 'CSV Export' })
  }

  // Main function of the block
  solution() {
    const ports = this.getInPorts();
    ports.forEach((_, index) => {
      const inpt = this.getNodeByInput(index);
      if (inpt && inpt.solve) {
        const value = inpt.solve()
        this.mapValues.set(this.columnNames[index], [...(this.mapValues.get(this.columnNames[index]) || []), value]);
      }
    });
  }

  reset() {
    this.mapValues = new Map([]);
  }

  buildInputs() {
    const inports = this.getInPorts();
    inports.filter(inport => !this.columnNames.includes(inport.options.name)).forEach(inport => this.removePort(inport));
    this.columnNames
      .filter((name) => !inports.some(inport => inport.options.name === name))
      .forEach((name) => {
        this.createPort(name, true);
      });
    if (this.component) {
      this.component.forceUpdate();
    }

  }

  generateCSV = () => {
    const time = Simulation.getTotalTimeArray();
    const rows = [['Time', ...this.columnNames]];

    for (let i = 0; i < time.length - 1; i++) {
      const row = [time[i]];
      this.mapValues.forEach(valueArray => {
        row.push(valueArray[i] !== undefined ? valueArray[i] : '');
      });
      rows.push(row);
    }

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "simulation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  icon = () => (
    <svg viewBox="0 0 300 400" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#008000" strokeWidth="5" width="300" height="400" x="0" y="0" ry="8" />
      <rect fill="#FFFFFF" strokeWidth="18" width="260" height="360" x="20" y="20" ry="0" />
      <rect fill="#99cd43" width="260" height="90" x="20" y="292" ry="0" />
      <path fill="#004433" d="m 150,249 -55,-55 v -35 l 45,45 V 84 c 0,-12 18,-12 18,0 V 204 l 46,-45 v 35 z" />
      <text x="75" y="366" fontSize="85">CSV</text>
    </svg>
  );

  settings = _ => {
    const ControlEditor = () => {
      
      const [names, setNames] = useState([...this.columnNames]);

      useEffect(() => {
        this.columnNames = names;
        this.buildInputs();
      }, [names]);

      return (
        <div>
          <p>This block exports the input values to a CSV file. You can add new input ports, name the columns, and download the CSV.</p>
          {names.map((name, index) => (
            <InputGroup
              key={index}
              label={`Column ${index + 1} name`}
              value={name}
              setValue={e => setNames( old => old.map(n => n === name? e : n ))}
            />
          ))}
          <button className='btn' onClick={ () => setNames(old => [...old, `Input ${this.columnNames.length}`]) }>Add port</button>
          <button className='btn' onClick={this.generateCSV}>Download CSV</button>
        </div>
      );
    }

    useModal.configure(this, 'CSV Export Block', <ControlEditor />, true);
  }

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
    this.buildInputs();
  }


}

export default ExportCSVModel;
