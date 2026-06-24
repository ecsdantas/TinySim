import { describe, it, expect } from 'vitest';
import { detectAlgebraicLoop } from './algebraicLoop';

// Builds a fake SimNodeModel-like node wired to the given input nodes.
// `inputs[i]` is the node connected to in-port `i` (or null/undefined for
// an unconnected port).
function makeNode(name, inputs = [], breaksAlgebraicLoop = false) {
    const node = {
        breaksAlgebraicLoop,
        getModelName: () => name,
        getInPorts: () => inputs.map((_, i) => i),
        getNodeByInput: (i) => inputs[i] ?? null,
    };
    return node;
}

describe('detectAlgebraicLoop', () => {
    it('reports no cycle for a simple feed-forward chain', () => {
        const c = makeNode('C');
        const b = makeNode('B', [c]);
        const a = makeNode('A', [b]);

        expect(detectAlgebraicLoop([a, b, c]).hasCycle).toBe(false);
    });

    it('detects a direct feedback cycle between two combinational blocks', () => {
        const a = makeNode('A');
        const b = makeNode('B', [a]);
        a.getNodeByInput = (i) => (i === 0 ? b : null);
        a.getInPorts = () => [0];

        const result = detectAlgebraicLoop([a, b]);

        expect(result.hasCycle).toBe(true);
        expect(result.cycleLabels).toContain('A');
        expect(result.cycleLabels).toContain('B');
    });

    it('detects a node feeding back into itself', () => {
        const a = makeNode('A');
        a.getNodeByInput = () => a;
        a.getInPorts = () => [0];

        expect(detectAlgebraicLoop([a]).hasCycle).toBe(true);
    });

    it('does not flag a loop that passes through a stateful block (e.g. Integrator/Memory)', () => {
        const a = makeNode('A');
        const integrator = makeNode('Integrator', [a], true);
        a.getNodeByInput = (i) => (i === 0 ? integrator : null);
        a.getInPorts = () => [0];

        const result = detectAlgebraicLoop([a, integrator]);

        expect(result.hasCycle).toBe(false);
    });

    it('does not flag a stateful block that feeds back into itself', () => {
        const integrator = makeNode('Integrator', [], true);
        integrator.getNodeByInput = () => integrator;
        integrator.getInPorts = () => [0];

        expect(detectAlgebraicLoop([integrator]).hasCycle).toBe(false);
    });

    it('ignores nodes without port/input helpers (plain test doubles)', () => {
        const plain = { breaksAlgebraicLoop: false };
        expect(detectAlgebraicLoop([plain]).hasCycle).toBe(false);
    });
});
