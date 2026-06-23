import { describe, it, expect } from 'vitest';
import { BezierLinkModel } from './bezierLinks';

// computeCurvature(dx, dy) picks a curvature based on the angle of the
// segment between two points. It used to always return a flat 0.5
// regardless of angle (find() matched the first ascending breakpoint,
// and that breakpoint's curvature of 0 was falsy, so `|| 0.5` always won).
// These pin the corrected, angle-dependent behavior.
function curvatureAtDegrees(link, degrees) {
    const rad = (degrees * Math.PI) / 180;
    return link.computeCurvature(Math.cos(rad), Math.sin(rad));
}

describe('BezierLinkModel.computeCurvature', () => {
    const link = new BezierLinkModel();

    it('is nearly flat for near-horizontal connections', () => {
        expect(curvatureAtDegrees(link, 0)).toBe(0);
        expect(curvatureAtDegrees(link, 3)).toBe(0);
    });

    it('grows as the angle approaches vertical (90°)', () => {
        expect(curvatureAtDegrees(link, 10)).toBe(0.05);
        expect(curvatureAtDegrees(link, 30)).toBe(0.20);
        expect(curvatureAtDegrees(link, 45)).toBe(0.3);
        expect(curvatureAtDegrees(link, 90)).toBe(0.8);
    });

    it('shrinks again past vertical, back toward horizontal (180°)', () => {
        expect(curvatureAtDegrees(link, 135)).toBe(0.3);
        expect(curvatureAtDegrees(link, 175)).toBe(0);
        expect(curvatureAtDegrees(link, 179)).toBe(0); // beyond the last breakpoint: keep its value
    });

    it('is symmetric for negative angles (direction does not matter, only the angle)', () => {
        expect(curvatureAtDegrees(link, -90)).toBe(curvatureAtDegrees(link, 90));
        expect(curvatureAtDegrees(link, -45)).toBe(curvatureAtDegrees(link, 45));
    });

    it('does not collapse every angle to the same curvature', () => {
        const values = new Set([0, 10, 30, 45, 90, 135, 175].map(deg => curvatureAtDegrees(link, deg)));
        expect(values.size).toBeGreaterThan(1);
    });
});
