import { describe, it, expect, beforeEach } from 'vitest';
import StepModel from './step';
import Simulation from '../simulation/core';

describe('StepModel', () => {

    beforeEach(() => {
        Simulation.currentTime = 0;
    });

    it('outputs the initial value before step time', () => {
        const step = new StepModel({}, 1, 0, 5);
        Simulation.currentTime = 0.5;

        expect(step.solution()).toEqual({ out: 0 });
    });

    it('outputs the final value at and after step time', () => {
        const step = new StepModel({}, 1, 0, 5);
        Simulation.currentTime = 1;

        expect(step.solution()).toEqual({ out: 5 });
    });

    it('serializes the configured parameters', () => {
        const step = new StepModel({}, 2, -1, 3);

        expect(step.serialize()).toMatchObject({ stepTime: 2, initialValue: -1, finalValue: 3 });
    });
});
