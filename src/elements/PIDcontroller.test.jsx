import { describe, it, expect, beforeEach, vi } from 'vitest';
import PIDControllerModel from './PIDcontroller';
import Simulation from '../simulation/core';

// PIDControllerModel reads setpoint from input port 0 and the process
// value from input port 1.
function withInputs(pid, { setpoint, input }) {
    pid.getNodeByInput = vi.fn((index) => {
        if (index === 0) return { solve: () => setpoint };
        if (index === 1) return { solve: () => input };
        return null;
    });
}

describe('PIDControllerModel', () => {

    beforeEach(() => {
        Simulation.currentStep = 0;
        Simulation.currentTime = 0;
    });

    it('computes a pure proportional response on the first step (no elapsed time yet)', () => {
        const pid = new PIDControllerModel({}, 2, 0, 0);
        withInputs(pid, { setpoint: 10, input: 4 });

        expect(pid.solution()).toEqual({ out: 12 }); // kp * error = 2 * (10-4)
    });

    it('accumulates the integral term over elapsed time', () => {
        const pid = new PIDControllerModel({}, 0, 1, 0); // ki = 1
        withInputs(pid, { setpoint: 10, input: 0 });

        pid.solution(); // t=0, deltaTime=0 -> integral stays 0
        Simulation.currentStep = 1;
        Simulation.currentTime = 1;
        const result = pid.solution(); // deltaTime=1, error=10, integral=10

        expect(result).toEqual({ out: 10 });
    });

    it('reacts to the error derivative once time has elapsed', () => {
        const pid = new PIDControllerModel({}, 0, 0, 1); // kd = 1
        withInputs(pid, { setpoint: 10, input: 0 }); // error=10

        pid.solution(); // t=0
        Simulation.currentStep = 1;
        Simulation.currentTime = 1;
        withInputs(pid, { setpoint: 10, input: 5 }); // error=5 now
        const result = pid.solution(); // derivative=(5-10)/1=-5

        expect(result).toEqual({ out: -5 });
    });

    it('reuses the cached output when called again on the same step (algebraic loop guard)', () => {
        const pid = new PIDControllerModel({}, 2, 0, 0);
        withInputs(pid, { setpoint: 10, input: 4 });

        const first = pid.solution();
        const second = pid.solution();

        expect(second).toEqual(first);
    });

    it('reset clears the accumulated state', () => {
        const pid = new PIDControllerModel({}, 0, 1, 0);
        withInputs(pid, { setpoint: 10, input: 0 });
        pid.solution();
        Simulation.currentStep = 1;
        Simulation.currentTime = 1;
        pid.solution();

        pid.reset();

        expect(pid.integral).toBe(0);
        expect(pid.previousTime).toBeNull();
        expect(pid.previousOutput).toBe(0);
    });
});
