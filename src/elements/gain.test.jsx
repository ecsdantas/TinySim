import { describe, it, expect, vi } from 'vitest';
import GainModel from './gain';

describe('GainModel', () => {

    it('multiplies the input by the configured gain', () => {
        const gain = new GainModel({}, 3);
        gain.getNodeByInput = vi.fn(() => ({ solve: () => 4 }));

        expect(gain.solution()).toEqual({ out: 12 });
    });

    it('outputs 0 when nothing is connected', () => {
        const gain = new GainModel();
        gain.getNodeByInput = vi.fn(() => null);

        expect(gain.solution()).toEqual({ out: 0 });
    });

    it('serializes the configured gain value', () => {
        const gain = new GainModel({}, 7);

        expect(gain.serialize().gainValue).toBe(7);
    });
});
