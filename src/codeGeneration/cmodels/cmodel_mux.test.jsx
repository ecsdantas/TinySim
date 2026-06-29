import { describe, it, expect, vi } from 'vitest';
import { MuxModel } from './cmodel_mux';

function makeContext(getNodeImpl) {
    return {
        addModelC__vars: vi.fn(),
        addModelC__step: vi.fn(),
        getNode: vi.fn(getNodeImpl),
    };
}

describe('MuxModel cmodel', () => {
    it('declares an array sized to the number of inputs and assigns each element', () => {
        const node = {
            CGenUID: 'mux1',
            isvisited: false,
            getInPorts: () => [{}, {}],
            getNodeByInput: (i) => ({ id: i }),
        };
        const ctx = makeContext((n) => `var_in${n.id}`);

        const result = MuxModel.call(ctx, node);

        expect(result).toBe('var_mux1_mux');
        expect(ctx.addModelC__vars).toHaveBeenCalledWith('double var_mux1_mux[2];');
        expect(ctx.addModelC__step).toHaveBeenCalledWith('var_mux1_mux[0] = var_in0;');
        expect(ctx.addModelC__step).toHaveBeenCalledWith('var_mux1_mux[1] = var_in1;');
        expect(node.isvisited).toBe(true);
    });

    it('returns the cached variable name without regenerating code when already visited', () => {
        const node = {
            CGenUID: 'mux2',
            isvisited: true,
            getInPorts: () => { throw new Error('should not be called when cached'); },
        };
        const ctx = makeContext(() => { throw new Error('should not be called when cached'); });

        expect(MuxModel.call(ctx, node)).toBe('var_mux2_mux');
    });
});
