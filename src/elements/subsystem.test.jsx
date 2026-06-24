import { describe, it, expect, vi } from 'vitest';
import SubsystemModel from './subsystem';
import SubsystemInputModel from './subsystemInput';
import SubsystemOutputModel from './subsystemOutput';

describe('SubsystemModel', () => {

    describe('syncPorts', () => {
        it('creates one external port per Input/Output marker found inside, in portIndex order', () => {
            const subsystem = new SubsystemModel();
            const input1 = new SubsystemInputModel();
            const output1 = new SubsystemOutputModel();
            const output2 = new SubsystemOutputModel();
            subsystem.internalModel.addNode(input1);
            subsystem.internalModel.addNode(output1);
            subsystem.internalModel.addNode(output2);

            subsystem.syncPorts();

            expect(subsystem.getInPorts().length).toBe(1);
            expect(subsystem.getOutPorts().length).toBe(2);
            expect(input1.parentSubsystem).toBe(subsystem);
            expect(input1.portIndex).toBe(0);
            expect(output1.portIndex).toBe(0);
            expect(output2.portIndex).toBe(1);
        });

        it('removes stale ports when run again with fewer markers', () => {
            const subsystem = new SubsystemModel();
            const output1 = new SubsystemOutputModel();
            const output2 = new SubsystemOutputModel();
            subsystem.internalModel.addNode(output1);
            subsystem.internalModel.addNode(output2);
            subsystem.syncPorts();
            expect(subsystem.getOutPorts().length).toBe(2);

            subsystem.internalModel.removeNode(output2);
            subsystem.syncPorts();

            expect(subsystem.getOutPorts().length).toBe(1);
        });
    });

    describe('solution', () => {
        it('resolves every output marker at once, keyed by port label', () => {
            const subsystem = new SubsystemModel();
            const outputMarker1 = { getNodeByInput: vi.fn(() => ({ solve: () => 7 })) };
            const outputMarker2 = { getNodeByInput: vi.fn(() => ({ solve: () => 9 })) };
            subsystem.getOutputMarkers = vi.fn(() => [outputMarker1, outputMarker2]);

            expect(subsystem.solution()).toEqual({ out1: 7, out2: 9 });
        });

        it('reports 0 for an output marker whose input is not connected', () => {
            const subsystem = new SubsystemModel();
            subsystem.getOutputMarkers = vi.fn(() => [{ getNodeByInput: vi.fn(() => null) }]);

            expect(subsystem.solution()).toEqual({ out1: 0 });
        });
    });

    describe('getOuterInputValue / getOuterInputLinearization', () => {
        it('reads from this Subsystem\'s own external input ports', () => {
            const subsystem = new SubsystemModel();
            subsystem.getNodeByInput = vi.fn((i) => (i === 0 ? { solve: () => 11, linearize: () => ({ numerator: [1], denominator: [1] }) } : null));

            expect(subsystem.getOuterInputValue(0)).toBe(11);
            expect(subsystem.getOuterInputLinearization(0)).toEqual({ numerator: [1], denominator: [1] });
            expect(() => subsystem.getOuterInputLinearization(1)).toThrow();
        });
    });

    describe('linearize', () => {
        it('returns the transfer function of the output marker matching this.calledPort', () => {
            const subsystem = new SubsystemModel();
            const outputMarker = { getNodeByInput: vi.fn(() => ({ linearize: () => ({ numerator: [2], denominator: [1, 0] }) })) };
            subsystem.getOutputMarkers = vi.fn(() => [outputMarker]);
            subsystem.calledPort = { options: { label: 'out1' } };

            expect(subsystem.linearize()).toEqual({ numerator: [2], denominator: [1, 0] });
        });

        it('throws when the requested output is not connected internally', () => {
            const subsystem = new SubsystemModel();
            subsystem.getOutputMarkers = vi.fn(() => [{ getNodeByInput: vi.fn(() => null) }]);
            subsystem.calledPort = { options: { label: 'out1' } };

            expect(() => subsystem.linearize()).toThrow();
        });
    });

    describe('reset', () => {
        it('resets every node inside the internal model', () => {
            const subsystem = new SubsystemModel();
            const innerNode = { reset: vi.fn() };
            subsystem.internalModel.getNodes = vi.fn(() => [innerNode]);

            subsystem.reset();

            expect(innerNode.reset).toHaveBeenCalledTimes(1);
        });
    });

    describe('serialize/deserialize', () => {
        it('serialize includes the internal model', () => {
            const subsystem = new SubsystemModel();
            expect(subsystem.serialize().internalModel).toBeDefined();
        });

        it('deserialize creates an empty internal model when none is present', () => {
            const subsystem = new SubsystemModel();
            subsystem.deserialize({ data: { CGenUID: 'sub0', flip: false } });

            expect(subsystem.internalModel.getNodes()).toEqual([]);
            expect(subsystem.getInPorts().length).toBe(0);
        });
    });
});

describe('SubsystemInputModel', () => {
    it('delegates to its parent Subsystem\'s external input', () => {
        const input = new SubsystemInputModel();
        const parent = { getOuterInputValue: vi.fn(() => 42) };
        input.parentSubsystem = parent;
        input.portIndex = 2;

        expect(input.solution()).toEqual({ out: 42 });
        expect(parent.getOuterInputValue).toHaveBeenCalledWith(2);
    });

    it('outputs 0 when not yet bound to a parent Subsystem', () => {
        const input = new SubsystemInputModel();
        expect(input.solution()).toEqual({ out: 0 });
    });
});

describe('SubsystemOutputModel', () => {
    it('passes through whatever is connected to its input', () => {
        const output = new SubsystemOutputModel();
        output.getNodeByInput = vi.fn(() => ({ solve: () => 13 }));

        expect(output.solution()).toEqual({ out: 13 });
    });

    it('outputs 0 when its input is not connected', () => {
        const output = new SubsystemOutputModel();
        output.getNodeByInput = vi.fn(() => null);

        expect(output.solution()).toEqual({ out: 0 });
    });
});
