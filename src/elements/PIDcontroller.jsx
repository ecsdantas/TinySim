import React, { useState, useEffect } from 'react';
import { SimNodeModel } from '../nodes/nodes/simNodeModel';
import { useModal } from '../components/modal';
import Simulation from '../simulation/core';
import { InputGroup } from '../components/inputGroup';

class PIDControllerModel extends SimNodeModel {
  kind = 'pidController';
  isTerminalBlock = false;
  kp = 0.3;
  ki = 0.02;
  kd = 0.001;
  setpoint = 0.0;
  integral = 0.0;
  previousError = 0.0;
  previousTime = null;
  previousOutput = 0.0;
  previousStep = null;

  constructor(options = {}, kp = 0.5, ki = 0.02, kd = 0.001) {
    super({ ...options, name: 'PID Controller' });
    this.createPort('setpoint', true);
    this.createPort('in', true);
    this.createPort('out', false);
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }

  // Main function of the block
  solution() {
    const currentTime = Simulation.getCurrentTime();
    const currentStep = Simulation.getCurrentStep();

    // Prevent algebraic loops (must run before recursing into inputs)
    if (this.previousStep === currentStep) {
      return { 'out': this.previousOutput };
    }
    this.previousStep = currentStep;

    const setpointInput = this.getNodeByInput(0);
    const inpt = this.getNodeByInput(1);

    let input = 0.0;
    if (inpt && inpt.solve) {
      input = inpt.solve();
    }

    if (setpointInput && setpointInput.solve) {
      this.setpoint = setpointInput.solve();
    }

    const deltaTime = this.previousTime !== null ? (currentTime - this.previousTime) : 0;
    const error = this.setpoint - input;

    this.integral += error * deltaTime;
    const derivative = deltaTime > 0 ? (error - this.previousError) / deltaTime : 0;

    const output = this.kp * error + this.ki * this.integral + this.kd * derivative;

    this.previousError = error;
    this.previousTime = currentTime;
    this.previousOutput = output;
    this.previousStep = currentStep;

    return { 'out': output };
  }

  reset() {
    super.reset();
    this.integral = 0.0;
    this.previousError = 0.0;
    this.previousTime = null;
    this.previousOutput = 0.0;
    this.previousStep = null;
  }

  icon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" stroke="#000000" strokeWidth="1" />
      <text x="4" y="16" fontFamily="Arial" fontSize="10" fill="#000000">
        {this.kp !== 0 ? 'P' : ''}
        {this.ki !== 0 ? 'I' : ''}
        {this.kd !== 0 ? 'D' : ''}
      </text>
    </svg>
  );

  settings = _ => {
    const ControlEditor = () => {
      const [kp, setKp] = useState(this.kp);
      const [ki, setKi] = useState(this.ki);
      const [kd, setKd] = useState(this.kd);

      useEffect(() => {
        this.kp = parseFloat(kp);
        this.ki = parseFloat(ki);
        this.kd = parseFloat(kd);
        this.update();
      }, [kp, ki, kd]);

      return (
        <div>
          <p>This block implements a PID controller.</p>
          <InputGroup label="Kp" value={kp} setValue={e => setKp(e)} />
          <InputGroup label="Ki" value={ki} setValue={e => setKi(e)} />
          <InputGroup label="Kd" value={kd} setValue={e => setKd(e)} />
        </div>
      );
    }

    useModal.configure(this, 'PID Controller Block', <ControlEditor />, true);
  }
}

export default PIDControllerModel;
