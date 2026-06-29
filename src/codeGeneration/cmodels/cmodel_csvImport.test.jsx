import { describe, it, expect, vi } from 'vitest';
import { ImportCSVModel } from './cmodel_csvImport';

function makeContext() {
    return {
        addLibsH__include: vi.fn(),
        addLibsC__functions: vi.fn(),
        addLibsH__declaration: vi.fn(),
        addModelC__init: vi.fn(),
        addModelC__vars: vi.fn(),
        addModelC__step: vi.fn(),
        addModelC__term: vi.fn(),
        addExtraFile: vi.fn(),
    };
}

function makeNode(overrides = {}) {
    const columnNames = ['Time', 'Sensor1'];
    const mapValues = new Map([
        ['Time', [0, 1, 2]],
        ['Sensor1', [10, 20, 30]],
    ]);
    return {
        CGenUID: 'csvImp1',
        calledPort: { options: { label: 'Sensor1' } },
        columnNames,
        mapValues,
        getOutPorts: () => columnNames.map((name) => ({ options: { name } })),
        isvisited: false,
        ...overrides,
    };
}

describe('ImportCSVModel cmodel', () => {
    it('uses a filename unique to this node instance (not the literal "data.csv")', () => {
        const node = makeNode();
        const ctx = makeContext();

        ImportCSVModel.call(ctx, node);

        const varsCalls = ctx.addModelC__vars.mock.calls.map((c) => c[0]);
        expect(varsCalls.some((line) => line.includes('"data_csvImp1.csv"'))).toBe(true);
        expect(varsCalls.some((line) => line.includes('"data.csv"'))).toBe(false);
    });

    it('guards lookup_csv against a NULL/empty table instead of dereferencing it', () => {
        const node = makeNode();
        const ctx = makeContext();

        ImportCSVModel.call(ctx, node);

        const libFunctions = ctx.addLibsC__functions.mock.calls.map((c) => c[0]).join('\n');
        expect(libFunctions).toMatch(/if\s*\(\s*!table\s*\|\|\s*!time\s*\|\|\s*\*size\s*==\s*0\s*\)/);
    });

    it('bundles the real CSV data (matching columnNames/mapValues) as an extra file in the zip', () => {
        const node = makeNode();
        const ctx = makeContext();

        ImportCSVModel.call(ctx, node);

        expect(ctx.addExtraFile).toHaveBeenCalledTimes(1);
        const [filename, content] = ctx.addExtraFile.mock.calls[0];
        expect(filename).toBe('data_csvImp1.csv');
        expect(content).toBe('Time,Sensor1\n0,10\n1,20\n2,30');
    });
});
