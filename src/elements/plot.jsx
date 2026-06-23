import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import LineChart from './complements/LineChart';
import { InputGroup, ColorPicker } from '../components/inputGroup';

class PlotModel extends SimNodeModel {
  kind = 'plot';
  isTerminalBlock = true;
  values = [];
  datasetSettings = [{ name: 'Dataset 1', color: '#4bc0c0' }];
  plotWidth = 'auto';
  plotHeight = 'auto';
  CGenUID = 'plot';
  tags = ['plot', 'chart', 'data', 'display', 'graph', 'line', 'plot'];
  points = Math.round(Simulation.getStopTime() / Simulation.getStepTime());

  constructor(options = {}) {
    super({ ...options, name: 'plot' });
    this.createPort('in1', true);
    this.component = null;
  }

  solution() {
    this.getInPorts().forEach((port, index) => {
      const inpt = this.getNodeByInput(index);
      if (inpt && inpt.solve) {
        if (!this.values[index]) this.values[index] = [];
        this.values[index].push(inpt.solve());
      }
    });
    if (this.values[0]?.length > 0 && this.component) this.update();
  }

  reset() {
    this.values = [];
  }

  icon = () => {
    const GenColor = (index) => this.datasetSettings[index]?.color || `#${((1 << 24) + (index * 60 << 16) + (70 << 8) + 50).toString(16).slice(1)}`;
    if (this.component && this.values[0]?.length > 0 && (Simulation.realTimeMode || !Simulation.isRunning)) {
      const datasets = this.getInPorts().map((_, index) => ({
        label: this.datasetSettings[index]?.name || `Dataset ${index + 1}`,
        data: this.values[index],
        fill: false,
        backgroundColor: GenColor(index),
        borderColor: GenColor(index),
        tension: 0.1,
      }));
      return <LineChart {...{ time: Simulation.getTimeArray(), datasets, plotWidth: this.plotWidth, plotHeight: this.plotHeight }} />;
    }
    return (
      <svg width="100" height="30" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="100%" fill="#000000" />
        <path style={{ opacity: 0.4, stroke: '#b3b3b3', strokeWidth: 1 }} d="M 88,7 V 23 M 80,7 V 23 M 73,7 V 23 M 65,7 V 23 M 57,7 V 23 M 49,7 V 23 M 41,7 V 23 M 33,7 V 23 M 25,7 V 23 M 10,7 V 23 M 18,7 v 16 m -11,0 h 87 M 7,15 h 87 M 7,7 h 87" />
        <path style={{ stroke: '#008080', fill: 'none', strokeWidth: 2 }} d="m 10,23 c 0,0 1,-10 14,-13 13,-3 90,-3 50,-3" />
      </svg>
    );
  };

  refresh() {
    this.component && this.component.forceUpdate();
  }

  settings = () => {
    const ControlEditor = () => {
      const [state, setState] = useState({
        settings: this.datasetSettings,
        chartWidth: this.plotWidth,
        chartHeight: this.plotHeight,
      });

      useEffect(() => {
        state.chartHeight.length > 2 && (this.plotHeight = state.chartHeight);
        state.chartWidth.length > 2 && (this.plotWidth = state.chartWidth);
        this.refresh();
      }, [state]);

      const updateSettings = (index, key, value) => {
        const newSettings = [...state.settings];
        newSettings[index][key] = value;
        setState({ ...state, settings: newSettings });
        this.datasetSettings = newSettings;
      };

      const addPort = () => {
        const portCount = this.getInPorts().length + 1;
        this.createPort(`in${portCount}`, true);
        const newSettings = [
          ...state.settings,
          { name: `Dataset ${portCount}`, color: `#${Math.floor(Math.random() * 16777215).toString(16)}` },
        ];
        setState({ ...state, settings: newSettings });
        this.datasetSettings = newSettings;
      };

      const exportToPng = () => {
        const canvas = document.querySelector('canvas');
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'plot.png';
        link.click();
      };

      return (
        <div>
          <p>This block plots the input values over time. You can add new input ports to plot multiple datasets and customize their names and colors.<br />
            Adjust the chart dimensions as needed and export the plot as a PNG image.</p>
          {state.settings.map((setting, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <InputGroup label={`Dataset ${index + 1} Name`} value={setting.name} setValue={e => updateSettings(index, 'name', e)} />
              <ColorPicker value={setting.color} setValue={e => updateSettings(index, 'color', e)} />
            </div>
          ))}
          <InputGroup label="Chart Width" value={state.chartWidth} setValue={value => setState({ ...state, chartWidth: value })} unit="px or 'auto'" />
          <InputGroup label="Chart Height" value={state.chartHeight} setValue={value => setState({ ...state, chartHeight: value })} unit="px or 'auto'" />
          <button className='btn' onClick={addPort} style={{ marginRight: '10px' }}>Add Port</button>
          <button className='btn' onClick={exportToPng}>Save as PNG</button>
        </div>
      );
    };

    useModal.configure(this, 'Plot Block', <ControlEditor />, true);
  }

  serialize() {
    const data = super.serialize();
    return {
      ...data,
      datasetSettings: this.datasetSettings,
      plotWidth: this.plotWidth,
      plotHeight: this.plotHeight,
    };
  }

  deserialize(event) {
    super.deserialize(event);
    this.datasetSettings = event.data.datasetSettings || [];
    this.plotWidth = event.data.plotWidth || 'auto';
    this.plotHeight = event.data.plotHeight || 'auto';
  }
}

export default PlotModel;
