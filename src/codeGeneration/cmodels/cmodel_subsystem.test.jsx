import { describe, it, expect, vi } from 'vitest';
import { SubsystemModel, SubsystemOutputModel, SubsystemInputModel } from './cmodel_subsystem';

describe('SubsystemModel cmodel', () => {
    it('delegates to the output marker matching the called port', () => {
        const outputMarker = {};
        const node = {
            calledPort: { options: { label: 'out2' } },
            getOutputMarkers: () => [{}, outputMarker],
            getModelName: () => 'SubsystemModel',
        };
        const ctx = { getNode: vi.fn((m) => (m === outputMarker ? 'var_inner_add' : 'wrong')) };

        expect(SubsystemModel.call(ctx, node)).toBe('var_inner_add');
    });

    it('throws when the requested output does not exist', () => {
        const node = {
            calledPort: { options: { label: 'out1' } },
            getOutputMarkers: () => [],
            getModelName: () => 'SubsystemModel',
        };

        expect(() => SubsystemModel.call({}, node)).toThrow();
    });
});

describe('SubsystemOutputModel cmodel', () => {
    it('delegates to whatever feeds it internally', () => {
        const inner = {};
        const node = { getNodeByInput: () => inner, getModelName: () => 'SubsystemOutputModel' };
        const ctx = { getNode: vi.fn((n) => (n === inner ? 'var_inner_add' : 'wrong')) };

        expect(SubsystemOutputModel.call(ctx, node)).toBe('var_inner_add');
    });

    it('throws when disconnected internally', () => {
        const node = { getNodeByInput: () => null, getModelName: () => 'SubsystemOutputModel' };

        expect(() => SubsystemOutputModel.call({}, node)).toThrow();
    });
});

describe('SubsystemInputModel cmodel', () => {
    it('delegates outward to the parent subsystem external input', () => {
        const outer = {};
        const node = {
            portIndex: 1,
            parentSubsystem: { getNodeByInput: (i) => (i === 1 ? outer : null) },
            getModelName: () => 'SubsystemInputModel',
        };
        const ctx = { getNode: vi.fn((n) => (n === outer ? 'var_outer_gain' : 'wrong')) };

        expect(SubsystemInputModel.call(ctx, node)).toBe('var_outer_gain');
    });

    it('throws when the external input is not connected', () => {
        const node = {
            portIndex: 0,
            parentSubsystem: { getNodeByInput: () => null },
            getModelName: () => 'SubsystemInputModel',
        };

        expect(() => SubsystemInputModel.call({}, node)).toThrow();
    });
});
