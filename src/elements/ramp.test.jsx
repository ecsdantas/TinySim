import { describe, it, expect, beforeEach } from 'vitest';
import RampModel from './ramp';
import Simulation from '../simulation/core';

describe('RampModel', () => {

    beforeEach(() => {
        Simulation.currentTime = 0;
    });

    it('outputs the initial output before start time', () => {
        const ramp = new RampModel({}, 2, 1, 0);
        Simulation.currentTime = 0.5;

        expect(ramp.solution()).toEqual({ out: 0 });
    });

    it('ramps up linearly after start time', () => {
        const ramp = new RampModel({}, 2, 1, 0);
        Simulation.currentTime = 3;

        expect(ramp.solution()).toEqual({ out: 4 }); // 2 * (3-1)
    });

    it('adds the initial output as an offset', () => {
        const ramp = new RampModel({}, 1, 0, 5);
        Simulation.currentTime = 2;

        expect(ramp.solution()).toEqual({ out: 7 });
    });

    it('serializes the configured parameters', () => {
        const ramp = new RampModel({}, 3, 2, 1);

        expect(ramp.serialize()).toMatchObject({ slope: 3, startTime: 2, initialOutput: 1 });
    });
});
