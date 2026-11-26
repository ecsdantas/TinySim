import { describe, it, expect } from 'vitest';
import { formatProgress } from './menubar';

describe('menubar formatProgress', () => {
    it('is empty while the simulation is idle', () => {
        expect(formatProgress(null)).toBe('');
        expect(formatProgress({ running: false, fraction: 1, currentTime: 10, realTime: false })).toBe('');
    });

    it('shows the percentage of stopTime in standard mode', () => {
        expect(formatProgress({ running: true, fraction: 0, currentTime: 0, realTime: false })).toBe('0%');
        expect(formatProgress({ running: true, fraction: 0.426, currentTime: 4.26, realTime: false })).toBe('42%');
        expect(formatProgress({ running: true, fraction: 1, currentTime: 10, realTime: false })).toBe('100%');
    });

    it('shows the simulated time in real-time mode (no fixed end)', () => {
        expect(formatProgress({ running: true, fraction: 0.5, currentTime: 12.4, realTime: true })).toBe('t = 12.4 s');
    });
});
