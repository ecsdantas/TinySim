import { describe, it, expect, vi } from 'vitest';
import { HistogramModel } from './cmodel_histogram';

// Regression test for a real bug: the old implementation called
// node.getNodes() (a DiagramModel method, not present on a block instance)
// and crashed with "node.getNodes is not a function" for any Histogram
// block reached during code generation.

function makeContext() {
    return {
        addPort: vi.fn(),
        addModelC__step: vi.fn(),
        getNode: vi.fn((n) => `var_${n.id}`),
    };
}

describe('HistogramModel cmodel', () => {
    it('exposes one GET port per connected input, without calling node.getNodes()', () => {
        const node = {
            CGenUID: 'hist1',
            getInPorts: () => [{}, {}],
            getNodeByInput: (i) => ({ id: i }),
        };
        const ctx = makeContext();

        expect(() => HistogramModel.call(ctx, node)).not.toThrow();

        expect(ctx.addPort).toHaveBeenCalledWith('hist1_1', 0, 0);
        expect(ctx.addPort).toHaveBeenCalledWith('hist1_2', 0, 0);
        expect(ctx.addModelC__step).toHaveBeenCalledWith('model->data.hist1_1 = var_0;');
        expect(ctx.addModelC__step).toHaveBeenCalledWith('model->data.hist1_2 = var_1;');
    });

    it('does nothing (no crash) when there are no connected inputs', () => {
        const node = { CGenUID: 'hist2', getInPorts: () => [] };
        const ctx = makeContext();

        expect(() => HistogramModel.call(ctx, node)).not.toThrow();
        expect(ctx.addPort).not.toHaveBeenCalled();
    });
});
