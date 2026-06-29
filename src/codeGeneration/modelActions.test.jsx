import { describe, it, expect } from 'vitest';
import { ModelActions } from './modelActions';

describe('ModelActions.addExtraFile', () => {
    it('registers a file to be bundled in the generated zip', () => {
        const cstruct = { replacements: [], extraFiles: [] };
        const ma = new ModelActions(cstruct);

        ma.addExtraFile('data.csv', 'Time,A\n0,1');

        expect(cstruct.extraFiles).toEqual([{ filename: 'data.csv', content: 'Time,A\n0,1' }]);
    });

    it('dedupes by filename so the same cmodel can call it more than once safely', () => {
        const cstruct = { replacements: [], extraFiles: [] };
        const ma = new ModelActions(cstruct);

        ma.addExtraFile('data.csv', 'first');
        ma.addExtraFile('data.csv', 'second');
        ma.addExtraFile('other.csv', 'third');

        expect(cstruct.extraFiles).toEqual([
            { filename: 'data.csv', content: 'first' },
            { filename: 'other.csv', content: 'third' },
        ]);
    });
});
