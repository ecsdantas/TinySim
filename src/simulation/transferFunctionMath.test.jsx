import { describe, it, expect } from 'vitest';
import { multiplyPoly, addPoly, scalePoly, trimLeadingZeros, seriesTF, addTF, logSpace, LinearizationError } from './transferFunctionMath';

describe('transferFunctionMath', () => {
    it('multiplyPoly convolves two polynomials', () => {
        // (s + 1)(s + 2) = s^2 + 3s + 2
        expect(multiplyPoly([1, 1], [1, 2])).toEqual([1, 3, 2]);
    });

    it('addPoly right-aligns polynomials of different length before summing', () => {
        // (s + 1) + (2) = s + 3
        expect(addPoly([1, 1], [2])).toEqual([1, 3]);
    });

    it('scalePoly multiplies every coefficient by a constant', () => {
        expect(scalePoly([1, 2, 3], -2)).toEqual([-2, -4, -6]);
    });

    it('trimLeadingZeros drops leading zero coefficients but keeps at least one', () => {
        expect(trimLeadingZeros([0, 0, 1, 2])).toEqual([1, 2]);
        expect(trimLeadingZeros([0, 0])).toEqual([0]);
    });

    it('seriesTF multiplies numerators and denominators (cascaded blocks)', () => {
        // gain 2 (2/1) in series with integrator (1/s) = 2/s
        const result = seriesTF({ numerator: [2], denominator: [1] }, { numerator: [1], denominator: [1, 0] });
        expect(result).toEqual({ numerator: [2], denominator: [1, 0] });
    });

    it('addTF sums two transfer functions over a common denominator', () => {
        // 1/s + 1/s = 2s/s^2 (over the common denominator s*s, before simplification)
        const result = addTF({ numerator: [1], denominator: [1, 0] }, { numerator: [1], denominator: [1, 0] });
        expect(result.numerator).toEqual([2, 0]);
        expect(result.denominator).toEqual([1, 0, 0]);
    });

    it('addTF subtracts when sign is -1', () => {
        // 5/1 - 2/1 = 3/1
        const result = addTF({ numerator: [5], denominator: [1] }, { numerator: [2], denominator: [1] }, -1);
        expect(result).toEqual({ numerator: [3], denominator: [1] });
    });

    it('logSpace generates a log-spaced array between min and max', () => {
        const values = logSpace(1, 1000, 4);
        expect(values).toEqual([1, 10, 100, 1000]);
    });

    it('LinearizationError carries the offending node', () => {
        const node = { kind: 'multiply' };
        const error = new LinearizationError('cannot linearize', node);
        expect(error.node).toBe(node);
        expect(error.message).toBe('cannot linearize');
    });
});
