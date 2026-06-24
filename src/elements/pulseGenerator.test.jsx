import { describe, it, expect, beforeEach } from 'vitest';
import PulseGeneratorModel from './pulseGenerator';
import Simulation from '../simulation/core';

describe('PulseGeneratorModel', () => {

    beforeEach(() => {
        Simulation.currentTime = 0;
    });

    it('outputs 0 before the phase delay', () => {
        const pulse = new PulseGeneratorModel({}, 5, 1, 50, 1);
        Simulation.currentTime = 0.5;

        expect(pulse.solution()).toEqual({ out: 0 });
    });

    it('outputs the amplitude during the "on" portion of the period', () => {
        const pulse = new PulseGeneratorModel({}, 5, 1, 50, 0);
        Simulation.currentTime = 0.2;

        expect(pulse.solution()).toEqual({ out: 5 });
    });

    it('outputs 0 during the "off" portion of the period', () => {
        const pulse = new PulseGeneratorModel({}, 5, 1, 50, 0);
        Simulation.currentTime = 0.7;

        expect(pulse.solution()).toEqual({ out: 0 });
    });

    it('repeats periodically', () => {
        const pulse = new PulseGeneratorModel({}, 5, 1, 50, 0);
        Simulation.currentTime = 2.1; // elapsed = 0.1 within the 3rd period

        expect(pulse.solution()).toEqual({ out: 5 });
    });

    it('serializes the configured parameters', () => {
        const pulse = new PulseGeneratorModel({}, 5, 2, 25, 0.5);

        expect(pulse.serialize()).toMatchObject({ amplitude: 5, period: 2, pulseWidth: 25, phaseDelay: 0.5 });
    });
});
