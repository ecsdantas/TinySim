import { describe, it, expect } from 'vitest';

// Regression test for a circular-import deadlock: every element under
// src/elements used to import SimNodeModel from '../nodes/nodeModel',
// which re-exports the diagram Engine/Model and therefore pulls in
// elements/index.jsx (i.e. every block) again. That cycle happened to
// resolve correctly only when App.jsx/nodeModel.jsx was the first module
// loaded. Importing a block directly and first - exactly what a unit test
// or a tool like Storybook would do - hit
// "Class extends value undefined is not a constructor" instead. Elements
// now import the leaf module (`nodes/nodes/simNodeModel`) directly. These
// imports must stay the very first statements in this file so the test
// actually exercises a cold module graph.
import AverageModel from './average';
import ClockModel from './clock';
import ComparatorModel from './comparator';
import TextModel from './text';
import SwitchModel from './switch';

describe('elements can be imported standalone (no nodeModel.jsx/App.jsx entry point first)', () => {
    it.each([
        ['AverageModel', AverageModel],
        ['ClockModel', ClockModel],
        ['ComparatorModel', ComparatorModel],
        ['TextModel', TextModel],
        ['SwitchModel', SwitchModel],
    ])('%s instantiates and exposes a solution()', (_name, ModelClass) => {
        const instance = new ModelClass();
        expect(typeof instance.solution).toBe('function');
    });
});
