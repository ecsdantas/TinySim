import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../SimNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class CSVExportModel extends SimNodeModel {
  kind = 'csvExport';
  isTerminalBlock = true;
  values = [];
  columnNames = [];

  constructor(options = {}) {
    super({ ...options, name: 'CSV Export' });
    this.createPort('in1', true);
    this.values = [];
    this.columnNames = ['Input 1'];
    this.component = null;
  }

  // Main function of the block
  solution() {
    const ports = this.getInPorts();
    ports.forEach((port, index) => {
      const inpt = this.getNodeByInput(index);
      if (inpt && inpt.solve) {
        if (!this.values[index]) {
          this.values[index] = [];
        }
        this.values[index].push(inpt.solve());
      }
    });
  }

  reset() {
    super.reset();
    this.values = [];
  }

  generateCSV = () => {
    const { time } = Simulation;
    const rows = [['Time', ...this.columnNames]];

    for (let i = 0; i < time.length; i++) {
      const row = [time[i]];
      this.values.forEach(valueArray => {
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
      const [ports, setPorts] = useState(this.getInPorts().length);
      const [names, setNames] = useState([...this.columnNames]);

      const AddPorts = () => {
        const portCount = this.getInPorts().length + 1;
        this.createPort(`in${portCount}`, true);
        setPorts(portCount);
        setNames([...names, `Input ${portCount}`]);
        this.columnNames = [...names, `Input ${portCount}`];
        this.component && this.component.forceUpdate();
      }

      const handleNameChange = (index, newName) => {
        const newNames = [...names];
        newNames[index] = newName;
        setNames(newNames);
        this.columnNames[index] = newName;
        this.component && this.component.forceUpdate();
      }

      useEffect(() => {
        setNames([...this.columnNames]);
      }, [ports]);

      return (
        <div>
          <p>This block exports the input values to a CSV file. You can add new input ports, name the columns, and download the CSV.</p>
          {names.map((name, index) => (
            <InputGroup
              key={index}
              label={`Column ${index + 1} name`}
              value={name}
              setValue={e => handleNameChange(index, e.target.value)}
            />
          ))}
          <button className='btn' onClick={AddPorts}>Add port</button>
          <button className='btn' onClick={this.generateCSV}>Download CSV</button>
        </div>
      );
    }

    useModal.configure(this, 'CSV Export Block', <ControlEditor />, true);
  }
}

export default CSVExportModel;
