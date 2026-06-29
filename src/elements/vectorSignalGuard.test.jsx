import { describe, it, expect, vi } from 'vitest';
import { VectorSignalError } from '../simulation/vectorSignal';
import RelationalOperatorModel from './comparator';
import AndModel from './logicAND';
import SwitchModel from './switch';
import SqrtModel from './sqrt';
import PowModel from './pow';
import AverageModel from './average';
import GaugeModel from './gauge';

// Regression coverage for the Fase 1.1 guard rollout: blocks that read a
// raw inpt.solve() and do arithmetic/comparison on it must reject a vector
// signal with a clear VectorSignalError instead of silently producing a
// wrong/corrupted result (e.g. string concatenation, NaN, always-true
// comparisons). One representative block per call pattern, not all 32.

function withInputs(node, values) {
    node.getNodeByInput = vi.fn((i) => {
        const v = values[i];
        return v === undefined ? null : { solve: () => v };
    });
}

describe('assertScalar guard across Fase 1.1 blocks', () => {
    it('RelationalOperatorModel (2-input compare) rejects a vector input', () => {
        const cmp = new RelationalOperatorModel({}, 'equal');
        withInputs(cmp, [[1, 2], 3]);
        expect(() => cmp.solution()).toThrow(VectorSignalError);
    });

    it('RelationalOperatorModel still behaves normally for scalars (no regression)', () => {
        const cmp = new RelationalOperatorModel({}, 'equal');
        withInputs(cmp, [5, 5]);
        expect(cmp.solution()).toEqual({ out: 1 });
    });

    it('AndModel (variadic boolean reduce) rejects a vector input', () => {
        const and = new AndModel();
        withInputs(and, [[1, 0], 1]);
        expect(() => and.solution()).toThrow(VectorSignalError);
    });

    it('SwitchModel rejects a vector condition', () => {
        const sw = new SwitchModel();
        withInputs(sw, [10, [1, 0], 20]);
        expect(() => sw.solution()).toThrow(VectorSignalError);
    });

    it('SqrtModel rejects a vector input', () => {
        const sqrt = new SqrtModel();
        withInputs(sqrt, [[4, 9]]);
        expect(() => sqrt.solution()).toThrow(VectorSignalError);
    });

    it('PowModel rejects a vector base or exponent', () => {
        const pow = new PowModel();
        withInputs(pow, [[2, 3], 2]);
        expect(() => pow.solution()).toThrow(VectorSignalError);
    });

    it('AverageModel rejects a vector input', () => {
        const avg = new AverageModel();
        withInputs(avg, [[1, 2], 3]);
        expect(() => avg.solution()).toThrow(VectorSignalError);
    });

    it('GaugeModel rejects a vector input', () => {
        const gauge = new GaugeModel();
        withInputs(gauge, [[1, 2]]);
        expect(() => gauge.solution()).toThrow(VectorSignalError);
    });
});
