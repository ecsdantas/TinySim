import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimulationEngine } from './core';

function makeNode(overrides = {}) {
    return {
        isTerminalBlock: false,
        solution: vi.fn(),
        reset: vi.fn(),
        update: vi.fn(),
        ...overrides,
    };
}

describe('SimulationEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new SimulationEngine();
        engine.saveLog = false; // avoid noisy console output during tests
    });

    it('runSetup fails without a model', () => {
        expect(engine.runSetup()).toBe(false);
    });

    it('runSetup succeeds and pulls nodes from the model', () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        expect(engine.runSetup()).toBe(true);
    });

    it('runSetup fails and sets emergencyStop when the diagram has an algebraic loop', () => {
        const a = makeNode({ getInPorts: () => [0] });
        const b = makeNode({ getInPorts: () => [0], getNodeByInput: () => a });
        a.getNodeByInput = () => b;
        engine.setModel({ getNodes: () => [a, b] });

        expect(engine.runSetup()).toBe(false);
        expect(engine.emergencyStop).toBe(true);
    });

    it('runStep solves only terminal nodes and advances time', () => {
        const terminal = makeNode({ isTerminalBlock: true });
        const nonTerminal = makeNode({ isTerminalBlock: false });
        engine.setModel({ getNodes: () => [terminal, nonTerminal] });
        engine.runSetup();

        engine.runStep();

        expect(terminal.solution).toHaveBeenCalledTimes(1);
        expect(nonTerminal.solution).not.toHaveBeenCalled();
        expect(engine.getCurrentStep()).toBe(1);
        expect(engine.getCurrentTime()).toBe(engine.getStepTime());
    });

    it('runStep sets emergencyStop and does not advance time when a node throws', () => {
        const terminal = makeNode({
            isTerminalBlock: true,
            solution: vi.fn(() => { throw new Error('boom'); }),
        });
        engine.setModel({ getNodes: () => [terminal] });
        engine.runSetup();

        engine.runStep();

        expect(engine.emergencyStop).toBe(true);
        expect(engine.getCurrentStep()).toBe(0);
    });

    it('runStandard loops while stopTime has not been reached', () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        engine.setSimulationTime(1, 3);
        engine.isSimulationRunning = true;

        engine.runStandard();

        expect(terminal.solution).toHaveBeenCalledTimes(4); // t = 0,1,2,3
        expect(engine.isSimulationRunning).toBe(false);
    });

    it('runStandard stops immediately on emergencyStop', () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        engine.setSimulationTime(1, 3);
        engine.isSimulationRunning = true;
        engine.emergencyStop = true;

        engine.runStandard();

        expect(terminal.solution).not.toHaveBeenCalled();
        expect(engine.isSimulationRunning).toBe(false);
    });

    it('resetSimulation zeroes counters and resets every node that supports it', () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        engine.runSetup();
        engine.runStep();

        engine.resetSimulation();

        expect(engine.getCurrentStep()).toBe(0);
        expect(engine.getCurrentTime()).toBe(0);
        expect(engine.emergencyStop).toBe(false);
        expect(engine.isSimulationRunning).toBe(false);
        expect(terminal.reset).toHaveBeenCalledTimes(1);
        expect(terminal.update).toHaveBeenCalledTimes(1);
    });

    it('getTotalTimeArray computes every sample from 0 to stopTime (plus one)', () => {
        engine.setSimulationTime(0.5, 2);
        expect(engine.getTotalTimeArray()).toEqual([0, 0.5, 1, 1.5, 2, 2.5]);
    });

    it('getTimeArray computes samples up to the current step', () => {
        engine.setModel({ getNodes: () => [] });
        engine.setSimulationTime(0.5, 10);
        engine.runSetup();
        engine.runStep();
        engine.runStep();

        expect(engine.getTimeArray()).toEqual([0, 0.5]);
    });
});
