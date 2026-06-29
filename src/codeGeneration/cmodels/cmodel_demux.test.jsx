import { describe, it, expect, vi } from 'vitest';
import { DemuxModel } from './cmodel_demux';

describe('DemuxModel cmodel', () => {
    it('returns an index expression into the upstream array variable based on calledPort', () => {
        const node = {
            calledPort: { options: { label: 'out2' } },
            getNodeByInput: vi.fn(() => ({})),
        };
        const ctx = { getNode: vi.fn(() => 'var_mux1_mux') };

        expect(DemuxModel.call(ctx, node)).toBe('var_mux1_mux[1]');
    });

    it('indexes from 0 for out1', () => {
        const node = {
            calledPort: { options: { label: 'out1' } },
            getNodeByInput: vi.fn(() => ({})),
        };
        const ctx = { getNode: vi.fn(() => 'var_mux1_mux') };

        expect(DemuxModel.call(ctx, node)).toBe('var_mux1_mux[0]');
    });
});
