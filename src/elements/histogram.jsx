import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import HistogramChart from './complements/HistogramChart';
import { InputGroup, ColorPicker } from '../components/inputGroup';
import { assertScalar } from '../simulation/vectorSignal';

class HistogramModel extends SimNodeModel {
  kind = 'histogram';
  isTerminalBlock = true;
  values = [];
  datasetSettings = [];
  plotWidth = 'auto';
  plotHeight = 'auto';
  CGenUID = 'hist';
  tags = ['histogram', 'plot', 'chart', 'data', 'display', 'graph', 'bar', 'hist', 'histogram'];

  constructor(options = {}) {
    super({ ...options, name: 'histogram' });
    this.createPort('in1', true);
    this.values = [];
    this.component = null;

    // Initialize default dataset settings
    this.datasetSettings = [{
      name: 'Dataset 1',
      color: '#4bc0c0',
    }];
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
        this.values[index].push(assertScalar(inpt.solve(), this.getModelName()));
      }
    });
    if (Simulation.getTimeArray().length === this.values[0]?.length && this.component) {
      this.update()
    }
  }

  reset() {
    super.reset();
    this.values = [];
  }

  icon = () => {
    const GenColor = (index) => this.datasetSettings[index]?.color || `#${((1 << 24) + (index * 60 << 16) + (70 << 8) + 50).toString(16).slice(1)}`;
    if (Simulation.getTimeArray().length === this.values[0]?.length) {
      const datasets = this.getInPorts().map((_, index) => ({
        label: this.datasetSettings[index]?.name || `Dataset ${index + 1}`,
        data: this.values[index],
        backgroundColor: GenColor(index),
        borderColor: GenColor(index),
      }));
      return <HistogramChart datasets={datasets} plotWidth={this.plotWidth} plotHeight={this.plotHeight} />;
    }

    // Return the default icon
    return (
        <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="100%" fill="#000000" />
        <path
            stroke='#b3b3b3' strokeWidth="1" opacity={ 0.4 }
            d="M 88,7 V 23 M 80,7 V 23 M 73,7 V 23 M 65,7 V 23 M 57,7 V 23 M 49,7 V 23 M 41,7 V 23 M 33,7 V 23 M 25,7 V 23 M 10,7 V 23 M 18,7 v 16 m -11,0 h 87 M 7,15 h 87 M 7,7 h 87"
        />
        <rect x="10" y="15" width="5" height="8" fill="#008080" />
        <rect x="20" y="12" width="5" height="11" fill="#008080" />
        <rect x="30" y="10" width="5" height="13" fill="#008080" />
        <rect x="40" y="7" width="5" height="16" fill="#008080" />
        <rect x="50" y="9" width="5" height="14" fill="#008080" />
        <rect x="60" y="14" width="5" height="9" fill="#008080" />
        <rect x="70" y="11" width="5" height="12" fill="#008080" />
        <rect x="80" y="8" width="5" height="15" fill="#008080" />
        </svg>

    );
  };

  settings = _ => {
    const ControlEditor = () => {
      const [settings, setSettings] = useState(this.datasetSettings);
      const [chartWidth, setChartWidth] = useState(this.plotWidth);
      const [chartHeight, setChartHeight] = useState(this.plotHeight);

      const handleNameChange = (index, newName) => {
        const newSettings = [...settings];
        newSettings[index].name = newName;
        setSettings(newSettings);
        this.datasetSettings = newSettings;
        this.component && this.component.forceUpdate();
      };

      const handleColorChange = (index, newColor) => {
        const newSettings = [...settings];
        newSettings[index].color = newColor;
        setSettings(newSettings);
        this.datasetSettings = newSettings;
        this.component && this.component.forceUpdate();
      };

      const handleWidthChange = (newWidth) => {
        this.plotWidth = newWidth;
        setChartWidth(this.plotWidth);
        this.component && this.component.forceUpdate();
      };

      const handleHeightChange = (newHeight) => {
        this.plotHeight = newHeight;
        setChartHeight(this.plotHeight);
        this.component && this.component.forceUpdate();
      };

      const AddPorts = () => {
        const portCount = this.getInPorts().length + 1;
        this.createPort(`in${portCount}`, true);
        const newSettings = [
          ...settings,
          {
            name: `Dataset ${portCount}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color
          },
        ];
        setSettings(newSettings);
        this.datasetSettings = newSettings;
        this.component && this.component.forceUpdate();
      }

      return (
        <div>
          <p>This block plots the input values as a histogram. You can add new input ports to plot multiple datasets and customize their names and colors.</p>
          <p>Not compatible with Code Generation</p>
          {settings.map((setting, index) => (
            <div key={index} style={{ display: 'flex' }}>
              <InputGroup
                label={`Dataset ${index + 1}`}
                value={setting.name}
                setValue={e => handleNameChange(index, e)}
              />
              <ColorPicker
                value={setting.color}
                setValue={e => handleColorChange(index, e)}
              />
            </div>
          ))}
          <InputGroup
            label="Chart Width"
            value={chartWidth}
            setValue={handleWidthChange}
            unit="px or 'auto'"
          />
          <InputGroup
            label="Chart Height"
            value={chartHeight}
            setValue={handleHeightChange}
            unit="px or 'auto'"
          />
          <button className='btn' onClick={AddPorts}>Add port</button>
        </div>
      );
    }

    useModal.configure(this, 'Histogram Block', <ControlEditor />, true);
  }
}

export default HistogramModel;
