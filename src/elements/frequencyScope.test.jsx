import { describe, it, expect, vi } from 'vitest';
import FrequencyScopeModel from './frequencyScope';
import GainModel from './gain';
import IntegratorModel from './integrator';
import { LinearizationError } from '../simulation/transferFunctionMath';

describe('FrequencyScopeModel', () => {
    it('reports an error when nothing is connected', () => {
        const scope = new FrequencyScopeModel();
        scope.getNodeByInput = vi.fn(() => null);

        scope.analyze();

        expect(scope.errorMessage).toMatch(/connect a block/i);
        expect(scope.bodeData).toBeNull();
    });

    it('computes the Bode plot for a chain of supported dynamic blocks (gain -> integrator)', () => {
        const source = { linearize: () => ({ numerator: [1], denominator: [1] }) };
        const gain = new GainModel({}, 2);
        gain.getNodeByInput = vi.fn(() => source);
        const integrator = new IntegratorModel();
        integrator.getNodeByInput = vi.fn(() => gain);

        const scope = new FrequencyScopeModel();
        scope.getNodeByInput = vi.fn(() => integrator);

        scope.analyze();

        expect(scope.errorMessage).toBeNull();
        expect(scope.bodeData).not.toBeNull();
        expect(scope.bodeData.magnitude.length).toBe(scope.numPoints);
        expect(scope.bodeData.phase.length).toBe(scope.numPoints);
        expect(scope.tfString).toContain('s');
    });

    it('surfaces the LinearizationError message when a block in the chain is unsupported', () => {
        const unsupported = {
            linearize: () => { throw new LinearizationError('"Multiply": cannot be linearized', unsupported); },
        };
        const scope = new FrequencyScopeModel();
        scope.getNodeByInput = vi.fn(() => unsupported);

        scope.analyze();

        expect(scope.errorMessage).toBe('"Multiply": cannot be linearized');
        expect(scope.bodeData).toBeNull();
    });
});
