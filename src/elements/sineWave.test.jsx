import { describe, it, expect, beforeEach } from 'vitest';
import SineWaveModel from './sineWave';
import Simulation from '../simulation/core';

describe('SineWaveModel', () => {

    beforeEach(() => {
        Simulation.currentTime = 0;
    });

    it('outputs the bias at t=0 with zero phase', () => {
        const sine = new SineWaveModel({}, 2, 1, 0, 1);
        Simulation.currentTime = 0;

        expect(sine.solution()).toEqual({ out: 1 }); // 2*sin(0) + 1
    });

    it('applies amplitude, frequency and phase', () => {
        const sine = new SineWaveModel({}, 2, Math.PI / 2, Math.PI / 2, 0);
        Simulation.currentTime = 1; // 2*sin(pi/2*1 + pi/2) = 2*sin(pi) ~= 0

        expect(sine.solution().out).toBeCloseTo(0, 5);
    });

    it('serializes the configured parameters', () => {
        const sine = new SineWaveModel({}, 2, 3, 1, 0.5);

        expect(sine.serialize()).toMatchObject({ amplitude: 2, frequency: 3, phase: 1, bias: 0.5 });
    });
});
