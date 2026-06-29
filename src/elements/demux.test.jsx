import { describe, it, expect, vi } from 'vitest';
import DemuxModel from './demux';

function withInput(node, value) {
    node.getNodeByInput = vi.fn(() => ({ solve: () => value }));
}

describe('DemuxModel', () => {
    it('splits a vector input into one scalar output per width', () => {
        const demux = new DemuxModel();
        withInput(demux, [10, 20]);
        expect(demux.solution()).toEqual({ out1: 10, out2: 20 });
    });

    it('resizes its outputs when the width is changed', () => {
        const demux = new DemuxModel();
        demux.setWidth(3);
        expect(demux.getOutPorts()).toHaveLength(3);

        withInput(demux, [1, 2, 3]);
        expect(demux.solution()).toEqual({ out1: 1, out2: 2, out3: 3 });
    });

    it('fills missing components with 0 if the input vector is shorter than the width', () => {
        const demux = new DemuxModel();
        withInput(demux, [5]);
        expect(demux.solution()).toEqual({ out1: 5, out2: 0 });
    });

    it('throws a clear error when fed a scalar instead of a vector', () => {
        const demux = new DemuxModel();
        withInput(demux, 7);
        expect(() => demux.solution()).toThrow(/sinal vetorial/);
    });
});
