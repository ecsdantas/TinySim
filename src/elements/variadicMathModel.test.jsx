import { describe, it, expect, vi } from 'vitest';
import AddModel from './add';
import SubModel from './sub';
import MultiplyModel from './multiply';
import DivideModel from './divide';
import ModModel from './mod';

// Stubs getNodeByInput(i) so solution() can be exercised without wiring up
// real ports/links through the diagram engine.
function withInputs(node, values) {
    node.getNodeByInput = vi.fn((i) => {
        const v = values[i];
        return v === undefined ? null : { solve: () => v };
    });
}

describe('VariadicMathModel-based blocks', () => {

    describe('AddModel', () => {
        it('sums every connected input', () => {
            const add = new AddModel();
            add.createPort('in3', true);
            withInputs(add, [2, 3, 4]);
            expect(add.solution()).toEqual({ out: 9 });
        });

        it('returns the identity (0) when nothing is connected', () => {
            const add = new AddModel();
            withInputs(add, []);
            expect(add.solution()).toEqual({ out: 0 });
        });
    });

    describe('SubModel', () => {
        it('subtracts every input after the first from in1', () => {
            const sub = new SubModel();
            sub.createPort('in3', true);
            withInputs(sub, [10, 3, 2]);
            expect(sub.solution()).toEqual({ out: 5 }); // 10 - 3 - 2
        });

        it('returns the identity (0) when nothing is connected', () => {
            const sub = new SubModel();
            withInputs(sub, []);
            expect(sub.solution()).toEqual({ out: 0 });
        });
    });

    describe('MultiplyModel', () => {
        it('multiplies every connected input', () => {
            const mul = new MultiplyModel();
            withInputs(mul, [3, 4]);
            expect(mul.solution()).toEqual({ out: 12 });
        });

        it('returns the identity (1) when nothing is connected', () => {
            const mul = new MultiplyModel();
            withInputs(mul, []);
            expect(mul.solution()).toEqual({ out: 1 });
        });
    });

    describe('DivideModel', () => {
        it('divides in1 by every subsequent input', () => {
            const div = new DivideModel();
            div.createPort('in3', true);
            withInputs(div, [100, 5, 2]);
            expect(div.solution()).toEqual({ out: 10 }); // 100 / 5 / 2
        });

        it('returns NaN when dividing by zero', () => {
            const div = new DivideModel();
            withInputs(div, [10, 0]);
            expect(div.solution().out).toBeNaN();
        });
    });

    describe('ModModel', () => {
        it('computes the remainder chained across inputs', () => {
            const mod = new ModModel();
            withInputs(mod, [10, 3]);
            expect(mod.solution()).toEqual({ out: 1 });
        });

        it('returns NaN when the divisor is zero', () => {
            const mod = new ModModel();
            withInputs(mod, [10, 0]);
            expect(mod.solution().out).toBeNaN();
        });
    });
});
