// Testes "golden" (de referência): travam a saída numérica ATUAL dos
// exemplos em public/samples/*.tsim e de um caso analítico montado em
// código, para que uma reescrita futura do engine de simulação (solver
// global, loop assíncrono, RK4 "de verdade"...) não mude os números em
// silêncio.
//
// Como regenerar os fixtures (só quando uma mudança numérica for
// INTENCIONAL e revisada):
//   PowerShell:  $env:UPDATE_GOLDEN='1'; npx vitest run src/simulation/samples.golden.test.jsx; Remove-Item Env:UPDATE_GOLDEN
//   Git Bash:    UPDATE_GOLDEN=1 npx vitest run src/simulation/samples.golden.test.jsx
// Os fixtures ficam em src/simulation/__golden__/*.json.
// Obs. (Windows): rode o vitest a partir de um diretório com a letra do
// drive em MAIÚSCULA (C:\...). Com cwd "c:\..." o vitest 4 carrega duas
// cópias do runner e TODAS as suítes falham com "Vitest failed to find the
// runner" / "Cannot read properties of undefined (reading 'config')".
//
// A simulação é dirigida de forma SÍNCRONA pelo singleton `Simulation`
// (os blocos leem Simulation.getCurrentStep()/getStepTime()/getMethod()),
// chamando runSetup()/resetSimulation()/runStep() em laço — de propósito
// sem usar run()/runStandardLoop, que devem virar assíncronos.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import createEngine, { DiagramModel, DefaultLinkModel, RightAngleLinkFactory } from '@projectstorm/react-diagrams';
import * as Elements from '../elements/index';
import { SimNodeFactory } from '../nodes/nodes/simNodeFactory';
import BezierLinkFactory from '../nodes/links/bezierLinkFactory';
import { BezierPortFactory } from '../nodes/ports/bezierPortFactory';
import { RightAnglePortFactory } from '../nodes/ports/rightAngleFactory';
import Simulation from './core';
import { EULER } from './integrationMethods';

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, 'public', 'samples');
const GOLDEN_DIR = path.join(ROOT, 'src', 'simulation', '__golden__');
const UPDATE = process.env.UPDATE_GOLDEN === '1';
const TOLERANCE = 1e-9;

// Exemplos cobertos e a configuração de tempo usada (os .tsim não guardam
// stepSize/stopTime, então fixamos aqui). Contínuos: dt=0.1 até 10 s;
// discretos/contadores: dt=1 até 100.
const COVERED = {
    basicfeedback: { stepSize: 0.1, stopTime: 10 },
    basicplot: { stepSize: 0.1, stopTime: 10 },
    computepi: { stepSize: 1, stopTime: 100 },
    laplace: { stepSize: 0.1, stopTime: 10 },
    logicgates: { stepSize: 1, stopTime: 10 },
    pi: { stepSize: 0.1, stopTime: 10 },
    pid: { stepSize: 0.1, stopTime: 10 },
    sar: { stepSize: 1, stopTime: 100 },
    signalsources: { stepSize: 0.1, stopTime: 10 },
    stepresponse: { stepSize: 0.1, stopTime: 10 },
};

// Exemplos deliberadamente fora da cobertura (não determinísticos ou
// dependentes de arquivo externo).
const SKIPPED = {
    gaussian: 'uses RandomNumberModel (non-deterministic output)',
    csvExample: 'uses ImportCSVModel (needs a user-provided CSV file at runtime)',
};

// ---------------------------------------------------------------------------
// Infra

// Engine isolado (não o Engine do app) com as mesmas fábricas que
// nodeModel.jsx registra no DOMContentLoaded, para desserializar .tsim.
function buildEngine() {
    const engine = createEngine({ registerDefaultZoomCanvasAction: false });
    Object.entries(Elements).forEach(([type, ModelClass]) => {
        class ElementNodeFactory extends SimNodeFactory {
            constructor() { super(type); }
            generateModel() { return new ModelClass(); }
        }
        engine.getNodeFactories().registerFactory(new ElementNodeFactory());
    });
    engine.getNodeFactories().registerFactory(new SimNodeFactory());
    engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
    engine.getLinkFactories().registerFactory(new BezierLinkFactory());
    engine.getPortFactories().registerFactory(new RightAnglePortFactory());
    engine.getPortFactories().registerFactory(new BezierPortFactory());
    return engine;
}

async function loadSample(engine, name) {
    const buffer = fs.readFileSync(path.join(SAMPLES_DIR, `${name}.tsim`));
    const zip = await JSZip.loadAsync(buffer);
    const modelData = JSON.parse(await zip.files['model.json'].async('text'));
    const model = new DiagramModel();
    model.deserializeModel(modelData, engine);
    return model;
}

// Roda a simulação inteira de forma síncrona e devolve as saídas de todos
// os blocos terminais. Display: valor a cada passo. Plot: séries
// acumuladas (`values`) ao final. Outros terminais: o que expuserem em
// `value`/`values` a cada passo.
function simulate(model, { stepSize, stopTime }) {
    Simulation.setSimulationTime(stepSize, stopTime);
    Simulation.setMethod(EULER);
    Simulation.statelessMode = false;
    Simulation.realTimeMode = false;
    Simulation.isSimulationRunning = false;
    Simulation.emergencyStop = false;

    Simulation.setModel(model); // chama runSetup() internamente
    if (Simulation.emergencyStop) throw new Error('runSetup failed (emergencyStop set)');
    Simulation.resetSimulation();

    const terminals = model.getNodes().filter(node => node.isTerminalBlock);
    const outputs = {};
    terminals.forEach(node => { outputs[`${node.getModelName()}#${node.getID()}`] = [] });

    const time = [];
    let guard = 0;
    while (Simulation.currentTime <= Simulation.stopTime) {
        time.push(Simulation.currentTime);
        Simulation.runStep();
        if (Simulation.emergencyStop) throw new Error(`simulation stopped at step ${Simulation.currentStep}`);
        terminals.forEach(node => {
            if (node.getModelName() === 'PlotModel') return; // lido ao final
            outputs[`${node.getModelName()}#${node.getID()}`].push(snapshot(node.value));
        });
        if (++guard > 100000) throw new Error('runaway simulation loop');
    }
    terminals.filter(node => node.getModelName() === 'PlotModel').forEach(node => {
        outputs[`${node.getModelName()}#${node.getID()}`] = snapshot(node.values);
    });

    return { stepSize, stopTime, method: 'EULER', steps: time.length, time, outputs };
}

function snapshot(value) {
    return value === undefined ? null : JSON.parse(JSON.stringify(value, encodeSpecial));
}

// JSON não representa NaN/Infinity: guardamos como strings marcadas.
function encodeSpecial(_key, value) {
    if (typeof value === 'number' && !Number.isFinite(value)) return `__num__:${value}`;
    return value;
}

// Compara recursivamente com tolerância 1e-9 (absoluta ou relativa).
function assertClose(actual, expected, where) {
    if (typeof expected === 'number' && typeof actual === 'number') {
        const diff = Math.abs(actual - expected);
        const ok = diff <= TOLERANCE || diff <= TOLERANCE * Math.abs(expected);
        if (!ok) throw new Error(`${where}: expected ${expected}, got ${actual} (diff ${diff})`);
        return;
    }
    if (Array.isArray(expected)) {
        if (!Array.isArray(actual)) throw new Error(`${where}: expected array, got ${JSON.stringify(actual)}`);
        if (actual.length !== expected.length) throw new Error(`${where}: expected length ${expected.length}, got ${actual.length}`);
        expected.forEach((v, i) => assertClose(actual[i], v, `${where}[${i}]`));
        return;
    }
    if (expected && typeof expected === 'object') {
        if (!actual || typeof actual !== 'object') throw new Error(`${where}: expected object, got ${JSON.stringify(actual)}`);
        const ek = Object.keys(expected).sort();
        const ak = Object.keys(actual).sort();
        if (JSON.stringify(ek) !== JSON.stringify(ak)) throw new Error(`${where}: keys differ: expected ${ek}, got ${ak}`);
        ek.forEach(k => assertClose(actual[k], expected[k], `${where}.${k}`));
        return;
    }
    if (actual !== expected) throw new Error(`${where}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function checkGolden(name, result) {
    const file = path.join(GOLDEN_DIR, `${name}.json`);
    if (UPDATE) {
        fs.mkdirSync(GOLDEN_DIR, { recursive: true });
        fs.writeFileSync(file, JSON.stringify(result, null, 1) + '\n');
        return;
    }
    if (!fs.existsSync(file)) {
        throw new Error(`Missing golden fixture ${file}. Generate it with UPDATE_GOLDEN=1 (see header of this file).`);
    }
    const expected = JSON.parse(fs.readFileSync(file, 'utf8'));
    assertClose(result, expected, name);
}

// ---------------------------------------------------------------------------
// Testes

let savedState;
beforeAll(() => {
    savedState = {
        stepSize: Simulation.stepSize, stopTime: Simulation.stopTime, method: Simulation.method,
        saveLog: Simulation.saveLog, statelessMode: Simulation.statelessMode, realTimeMode: Simulation.realTimeMode,
    };
    Simulation.saveLog = false; // evita console.clear()/logs por passo
});

afterAll(() => {
    Simulation.setSimulationTime(savedState.stepSize, savedState.stopTime);
    Simulation.setMethod(savedState.method);
    Simulation.saveLog = savedState.saveLog;
    Simulation.statelessMode = savedState.statelessMode;
    Simulation.realTimeMode = savedState.realTimeMode;
    Simulation.currentStep = 0;
    Simulation.currentTime = 0;
    Simulation.emergencyStop = false;
    Simulation.isSimulationRunning = false;
});

describe('golden: sample diagrams (Euler)', () => {
    const engine = buildEngine();

    it('every .tsim in public/samples is either covered or explicitly skipped', () => {
        const all = fs.readdirSync(SAMPLES_DIR).filter(f => f.endsWith('.tsim')).map(f => f.replace(/\.tsim$/, ''));
        const listed = [...Object.keys(COVERED), ...Object.keys(SKIPPED)];
        expect(all.filter(n => !listed.includes(n))).toEqual([]);
    });

    Object.entries(COVERED).forEach(([name, timing]) => {
        it(`${name}.tsim matches its reference output`, async () => {
            const model = await loadSample(engine, name);
            const result = simulate(model, timing);
            expect(Object.keys(result.outputs).length).toBeGreaterThan(0);
            checkGolden(name, result);
        });
    });

    Object.entries(SKIPPED).forEach(([name, reason]) => {
        it.skip(`${name}.tsim (skipped: ${reason})`, () => {});
    });
});

describe('golden: comparator sanity', () => {
    it('accepts differences within 1e-9 and rejects larger ones', () => {
        expect(() => assertClose({ a: [1, 'x', null] }, { a: [1 + 5e-10, 'x', null] }, 't')).not.toThrow();
        expect(() => assertClose([1e6 + 1e-4], [1e6], 't')).not.toThrow(); // relativo: 1e-10
        expect(() => assertClose([1.000001], [1], 't')).toThrow(/t\[0\]/);
        expect(() => assertClose([1, 2], [1, 2, 3], 't')).toThrow(/length/);
        expect(() => assertClose({ a: 1 }, { b: 1 }, 't')).toThrow(/keys differ/);
    });
});

describe('golden: analytic closed loop x\' = -x', () => {
    // Integrator(x0 = 1) -> Gain(-1) -> de volta na entrada do Integrator,
    // Display na saída. Euler com dt = 0.1: x[k] = (1 - 0.1)^k = 0.9^k.
    function buildLoop() {
        const model = new DiagramModel();
        const integrator = new Elements.IntegratorModel({}, 1);
        const gain = new Elements.GainModel({}, -1);
        const display = new Elements.DisplayModel();
        model.addAll(integrator, gain, display);
        const connect = (outPort, inPort) => {
            const link = new DefaultLinkModel();
            link.setSourcePort(outPort);
            link.setTargetPort(inPort);
            model.addLink(link);
        };
        connect(integrator.getOutPorts()[0], gain.getInPorts()[0]);
        connect(gain.getOutPorts()[0], integrator.getInPorts()[0]);
        connect(integrator.getOutPorts()[0], display.getInPorts()[0]);
        return { model, display };
    }

    it('produces x[k] = 0.9^k for 20 Euler steps and matches its reference', () => {
        const { model, display } = buildLoop();
        Simulation.setSimulationTime(0.1, 1.9);
        Simulation.setMethod(EULER);
        Simulation.statelessMode = false;
        Simulation.realTimeMode = false;
        Simulation.isSimulationRunning = false;
        Simulation.setModel(model);
        Simulation.resetSimulation();

        const values = [];
        for (let k = 0; k < 20; k++) {
            Simulation.runStep();
            expect(Simulation.emergencyStop).toBe(false);
            values.push(display.value);
        }

        values.forEach((v, k) => expect(v).toBeCloseTo(Math.pow(0.9, k), 12));
        checkGolden('analytic_exp_decay_euler', { stepSize: 0.1, steps: 20, method: 'EULER', x0: 1, values });
    });
});
