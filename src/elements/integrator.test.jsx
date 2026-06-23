import { describe, it, expect, beforeEach, vi } from 'vitest';
import IntegratorModel from './integrator';
import Simulation from '../simulation/core';

describe('IntegratorModel', () => {

    beforeEach(() => {
        Simulation.currentStep = 0;
        Simulation.stepSize = 1;
    });

    it('starts at the configured initial value', () => {
        const integrator = new IntegratorModel({}, 5);
        integrator.getNodeByInput = vi.fn(() => null);

        expect(integrator.solution()).toEqual({ out: 5 });
    });

    it('integrates the input using Euler (output lags one step behind the accumulator)', () => {
        const integrator = new IntegratorModel();
        integrator.getNodeByInput = vi.fn(() => ({ solve: () => 2 }));

        expect(integrator.solution()).toEqual({ out: 0 }); // t=0: reports initial value
        Simulation.currentStep = 1;
        expect(integrator.solution()).toEqual({ out: 2 }); // t=1: 0 + 2*1
        Simulation.currentStep = 2;
        expect(integrator.solution()).toEqual({ out: 4 }); // t=2: 2 + 2*1
    });

    it('does not double-integrate when called more than once on the same step (algebraic loop guard)', () => {
        const integrator = new IntegratorModel();
        integrator.getNodeByInput = vi.fn(() => ({ solve: () => 2 }));

        integrator.solution();
        integrator.solution();
        integrator.solution();

        Simulation.currentStep = 1;
        expect(integrator.solution()).toEqual({ out: 2 }); // still just one 2*1 accumulated
    });

    it('reset restores the initial value and clears the loop guard', () => {
        const integrator = new IntegratorModel({}, 5);
        integrator.getNodeByInput = vi.fn(() => ({ solve: () => 5 }));
        integrator.solution();
        Simulation.currentStep = 1;

        integrator.reset();

        expect(integrator.memoryValue).toBe(5);
        expect(integrator.lastStepSolved).toBeNull();
        expect(integrator.solution()).toEqual({ out: 5 });
    });
});
