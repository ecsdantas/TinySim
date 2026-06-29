import { describe, it, expect, vi } from 'vitest';
import MuxModel from './mux';
import AddModel from './add';
import { VectorSignalError } from '../simulation/vectorSignal';

function withInputs(node, values) {
    node.getNodeByInput = vi.fn((i) => {
        const v = values[i];
        return v === undefined ? null : { solve: () => v };
    });
}

describe('MuxModel', () => {
    it('combines every connected input into a single output vector, in port order', () => {
        const mux = new MuxModel();
        withInputs(mux, [1, 2]);
        expect(mux.solution()).toEqual({ out: [1, 2] });
    });

    it('grows the output vector when a port is added', () => {
        const mux = new MuxModel();
        mux.createPort('in3', true);
        mux.syncOutputWidth();
        withInputs(mux, [1, 2, 3]);
        expect(mux.solution()).toEqual({ out: [1, 2, 3] });
        expect(mux.getOutPorts()[0].getOptions().vectorWidth).toBe(3);
    });

    it('throws VectorSignalError if an input itself is already a vector', () => {
        const mux = new MuxModel();
        withInputs(mux, [[1, 2], 3]);
        expect(() => mux.solution()).toThrow(VectorSignalError);
    });

    it('feeding a Mux output directly into a scalar block (Add) throws a clear error instead of corrupting the result', () => {
        const mux = new MuxModel();
        withInputs(mux, [1, 2]);

        const add = new AddModel();
        add.getNodeByInput = vi.fn(() => ({ solve: () => mux.solution().out }));

        expect(() => add.solution()).toThrow(VectorSignalError);
    });
});
