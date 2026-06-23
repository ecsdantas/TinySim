import { describe, it, expect } from 'vitest';
import { EULER, HEUN, RK4, integrateLinearODE } from './integrationMethods';

describe('integrateLinearODE', () => {

    it('is identical across methods for a pure integrator (a = 0)', () => {
        const dt = 0.1;
        const u = 3;
        expect(integrateLinearODE(EULER, 1, u, 0, dt)).toBeCloseTo(1 + u * dt);
        expect(integrateLinearODE(HEUN, 1, u, 0, dt)).toBeCloseTo(1 + u * dt);
        expect(integrateLinearODE(RK4, 1, u, 0, dt)).toBeCloseTo(1 + u * dt);
    });

    it('RK4 tracks the exact exponential decay of dy/dt = -a*y far closer than Euler for large a*dt', () => {
        const a = 5, dt = 0.2, y0 = 1;
        const exact = y0 * Math.exp(-a * dt);

        const euler = integrateLinearODE(EULER, y0, 0, a, dt);
        const rk4 = integrateLinearODE(RK4, y0, 0, a, dt);

        expect(Math.abs(rk4 - exact)).toBeLessThan(Math.abs(euler - exact));
    });

    it('falls back to Euler for an unknown method code', () => {
        expect(integrateLinearODE(99, 1, 2, 0, 0.5)).toBeCloseTo(integrateLinearODE(EULER, 1, 2, 0, 0.5));
    });
});
