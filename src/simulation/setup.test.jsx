import { describe, it, expect } from 'vitest';
import { setupSimulation } from './setup';

function makeNode(name, inputs = [], breaksAlgebraicLoop = false) {
    return {
        breaksAlgebraicLoop,
        getModelName: () => name,
        getInPorts: () => inputs.map((_, i) => i),
        getNodeByInput: (i) => inputs[i] ?? null,
    };
}

describe('setupSimulation', () => {
    it('fails without a model', () => {
        expect(setupSimulation(null)).toEqual({ ok: false, nodes: null });
    });

    it('succeeds and returns the model nodes when there is no algebraic loop', () => {
        const a = makeNode('A');
        const result = setupSimulation({ getNodes: () => [a] });

        expect(result.ok).toBe(true);
        expect(result.nodes).toEqual([a]);
    });

    it('fails with a clear error when an algebraic loop is present', () => {
        const a = makeNode('A');
        const b = makeNode('B', [a]);
        a.getNodeByInput = (i) => (i === 0 ? b : null);
        a.getInPorts = () => [0];

        const result = setupSimulation({ getNodes: () => [a, b] });

        expect(result.ok).toBe(false);
        expect(result.error).toBe('algebraic-loop');
        expect(result.cycleLabels).toEqual(expect.arrayContaining(['A', 'B']));
    });

    it('succeeds when the only feedback path passes through a stateful block', () => {
        const a = makeNode('A');
        const integrator = makeNode('Integrator', [a], true);
        a.getNodeByInput = (i) => (i === 0 ? integrator : null);
        a.getInPorts = () => [0];

        const result = setupSimulation({ getNodes: () => [a, integrator] });

        expect(result.ok).toBe(true);
    });
});
