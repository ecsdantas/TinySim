import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    it('runStandard loops while stopTime has not been reached', async () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        engine.setSimulationTime(1, 3);
        engine.isSimulationRunning = true;

        await expect(engine.runStandard()).resolves.toBe(true);

        expect(terminal.solution).toHaveBeenCalledTimes(4); // t = 0,1,2,3
        expect(engine.isSimulationRunning).toBe(false);
    });

    it('runStandard stops immediately on emergencyStop', async () => {
        const terminal = makeNode({ isTerminalBlock: true });
        engine.setModel({ getNodes: () => [terminal] });
        engine.setSimulationTime(1, 3);
        engine.isSimulationRunning = true;
        engine.emergencyStop = true;

        await expect(engine.runStandard()).resolves.toBe(false);

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

    describe('chunked (non-blocking) run', () => {
        it('run() returns a Promise and only runs the first chunk synchronously', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 99); // 100 passos: t = 0..99
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            const promise = engine.run();

            expect(promise).toBeInstanceOf(Promise);
            expect(engine.getCurrentStep()).toBe(10);
            expect(engine.isSimulationRunning).toBe(true);
            expect(engine.isRunning).toBe(true);

            await expect(promise).resolves.toBe(true);
            expect(terminal.solution).toHaveBeenCalledTimes(100);
            expect(engine.getCurrentStep()).toBe(100);
            expect(engine.isSimulationRunning).toBe(false);
            expect(engine.isRunning).toBe(false);
        });

        it('yields to the event loop between chunks (timers can run mid-simulation)', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 999);
            const yieldFn = vi.fn(cb => setTimeout(cb, 0));
            engine.chunkOptions = { maxStepsPerChunk: 100, yieldFn };

            let stepWhenTimerFired = null;
            setTimeout(() => { stepWhenTimerFired = engine.getCurrentStep(); }, 0);

            await engine.run();

            // 10 fatias de 100 passos -> 9 devoluções de controle ao event loop
            expect(yieldFn).toHaveBeenCalledTimes(9);
            expect(stepWhenTimerFired).toBeGreaterThan(0);
            expect(stepWhenTimerFired).toBeLessThan(1000);
            expect(engine.getCurrentStep()).toBe(1000);
        });

        it('the default yield (MessageChannel) completes long runs', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 4999);
            engine.chunkOptions = { maxStepsPerChunk: 100 };

            await expect(engine.run()).resolves.toBe(true);
            expect(terminal.solution).toHaveBeenCalledTimes(5000);
        });

        it('respects the wall-clock budget per chunk', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 9);
            let clock = 0;
            // cada leitura do relógio avança 5 ms: com chunkMs = 10 cabem 2 passos por fatia
            engine.chunkOptions = { chunkMs: 10, now: () => (clock += 5) };

            const promise = engine.run();
            expect(engine.getCurrentStep()).toBe(2);
            await expect(promise).resolves.toBe(true);
            expect(engine.getCurrentStep()).toBe(10);
        });

        it('reports progress through subscribe() and onProgress', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 39);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            const seen = [];
            const unsubscribe = engine.subscribe(p => seen.push(p));
            engine.onProgress = vi.fn();

            await engine.run();
            unsubscribe();

            expect(seen.some(p => p.running && p.stopTime === 39)).toBe(true);
            const runningFractions = seen.filter(p => p.running).map(p => p.fraction);
            expect(runningFractions.length).toBeGreaterThan(2);
            // progresso monotônico
            runningFractions.forEach((f, i) => i > 0 && expect(f).toBeGreaterThanOrEqual(runningFractions[i - 1]));
            expect(seen[seen.length - 1]).toMatchObject({ running: false, fraction: 1, currentStep: 40 });
            expect(engine.onProgress).toHaveBeenCalled();

            // após cancelar a inscrição, não recebe mais nada
            const count = seen.length;
            engine.resetSimulation();
            expect(seen.length).toBe(count);
        });

        it('refreshes terminal blocks when the run finishes (plots draw at the end)', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 3);

            await engine.run();

            // 1x do resetSimulation() dentro de run() + 1x no fim da execução
            expect(terminal.update).toHaveBeenCalledTimes(2);
        });

        it('a runStep error ends the run and resolves the promise with false', async () => {
            let calls = 0;
            const terminal = makeNode({
                isTerminalBlock: true,
                solution: vi.fn(() => { if (++calls === 15) throw new Error('boom'); }),
            });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 99);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            await expect(engine.run()).resolves.toBe(false);
            expect(engine.getCurrentStep()).toBe(14);
            expect(engine.isSimulationRunning).toBe(false);
        });
    });

    describe('stop', () => {
        it('stop() mid-run halts the loop, keeps results and resolves with false', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 999);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            engine.subscribe(p => { if (p.running && p.currentStep >= 30) engine.stop(); });

            await expect(engine.run()).resolves.toBe(false);

            expect(engine.isSimulationRunning).toBe(false);
            expect(engine.getCurrentStep()).toBe(30);
            expect(terminal.solution).toHaveBeenCalledTimes(30);

            // o laço não continua depois de parado
            await new Promise(r => setTimeout(r, 20));
            expect(terminal.solution).toHaveBeenCalledTimes(30);
        });

        it('run() while running acts as Stop (Run/Stop button and ALT+1)', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 999);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            const first = engine.run();
            const second = engine.run();

            expect(engine.isSimulationRunning).toBe(false);
            await expect(first).resolves.toBe(false);
            await expect(second).resolves.toBe(false);
            expect(engine.getCurrentStep()).toBe(10);
        });

        it('stop() is a no-op when nothing is running', () => {
            expect(engine.stop()).toBe(false);
        });

        it('a new run after a stop is not disturbed by the old loop', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 49);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            const first = engine.run();
            engine.stop();
            const second = engine.run();

            await expect(first).resolves.toBe(false);
            await expect(second).resolves.toBe(true);
            // a segunda execução recomeçou do zero e rodou exatamente 50 passos
            expect(engine.getCurrentStep()).toBe(50);
            expect(terminal.solution).toHaveBeenCalledTimes(10 + 50);
        });

        it('resetSimulation() during a run stops it', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(1, 999);
            engine.chunkOptions = { maxStepsPerChunk: 10 };

            const promise = engine.run();
            engine.resetSimulation();

            await expect(promise).resolves.toBe(false);
            expect(engine.getCurrentStep()).toBe(0);
            expect(engine.emergencyStop).toBe(false);
            await new Promise(r => setTimeout(r, 20));
            expect(engine.getCurrentStep()).toBe(0);
        });
    });

    describe('real-time mode', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('uses a 0.2 s step while running without overwriting the user step size', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(0.01, 5);
            engine.realTimeMode = true;

            const promise = engine.run();
            expect(engine.getStepTime()).toBe(0.2);
            expect(engine.stepSize).toBe(0.01);
            expect(engine.getCurrentStep()).toBe(1);

            vi.advanceTimersByTime(1000); // 5 ticks de 200 ms
            expect(engine.getCurrentStep()).toBe(6);
            expect(engine.getCurrentTime()).toBeCloseTo(1.2, 12);
            expect(engine.getProgress()).toMatchObject({ running: true, realTime: true });

            engine.stop();
            await expect(promise).resolves.toBe(false);
            vi.advanceTimersByTime(1000);
            expect(engine.getCurrentStep()).toBe(6);

            // depois de parar, o eixo de tempo dos plots ainda usa 0.2 s...
            expect(engine.getTimeArray()).toEqual([0, 0.2, 0.4, 0.6000000000000001, 0.8, 1]);
            expect(engine.stepSize).toBe(0.01);

            // ...e, depois do reset, o passo do usuário volta a valer
            engine.realTimeMode = false;
            engine.resetSimulation();
            expect(engine.getStepTime()).toBe(0.01);
        });

        it('a standard run after a real-time run uses the user step size', async () => {
            vi.useRealTimers();
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(0.5, 2);

            engine.realTimeMode = true;
            engine.run();
            engine.stop();

            engine.realTimeMode = false;
            await expect(engine.run()).resolves.toBe(true);
            expect(engine.getStepTime()).toBe(0.5);
            expect(engine.getCurrentStep()).toBe(5); // t = 0, 0.5, 1, 1.5, 2
            expect(engine.getCurrentTime()).toBe(2.5);
        });

        it('setSimulationTime during a run updates the config but not the running step', () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(0.1, 5);
            engine.realTimeMode = true;
            engine.run();
            vi.advanceTimersByTime(400);
            const step = engine.getCurrentStep();

            engine.setSimulationTime(0.05, 7);

            expect(engine.stepSize).toBe(0.05);
            expect(engine.stopTime).toBe(7);
            expect(engine.getStepTime()).toBe(0.2);
            expect(engine.getCurrentStep()).toBe(step);
            engine.stop();
            engine.resetSimulation();
            expect(engine.getStepTime()).toBe(0.05);
        });
    });

    describe('time drift', () => {
        it('dt = 0.1 for 1000 steps gives currentTime = 100 within 1e-12', () => {
            engine.setModel({ getNodes: () => [makeNode({ isTerminalBlock: true })] });
            engine.setSimulationTime(0.1, 1000);
            for (let i = 0; i < 1000; i++) engine.runStep();
            expect(engine.getCurrentStep()).toBe(1000);
            // somar 0.1 mil vezes daria 99.9999999999986 (erro ~1.4e-12)
            expect(Math.abs(engine.getCurrentTime() - 100)).toBeLessThan(1e-12);
        });

        it('a full run with dt = 0.1 up to 10 s runs exactly 101 steps', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            engine.setSimulationTime(0.1, 10);
            await engine.run();
            expect(terminal.solution).toHaveBeenCalledTimes(101);
        });

        it('does not drop the last step when k*dt lands one ulp above stopTime', async () => {
            const terminal = makeNode({ isTerminalBlock: true });
            engine.setModel({ getNodes: () => [terminal] });
            // 3 * 0.1 = 0.30000000000000004 > 0.3
            engine.setSimulationTime(0.1, 0.3);
            await engine.run();
            expect(terminal.solution).toHaveBeenCalledTimes(4); // t = 0, 0.1, 0.2, 0.3
        });
    });
});
