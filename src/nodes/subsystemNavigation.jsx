import { Engine } from './engine';
import Simulation from '../simulation/core';

// Ad-hoc pub/sub singleton (same style as `useModal`) so App.jsx can render
// a breadcrumb without this module depending on React. Swaps the single
// global `Engine`'s model in place when entering/leaving a Subsystem's
// internal diagram, the same way undo/redo (`nodes/stack/stack.jsx`)
// restores a model in place rather than creating a new Engine per view.
//
// Known gap: the undo/redo Stack's model-change listeners are bound once,
// to whatever model was active when it was constructed, so undo/redo does
// not follow navigation into/out of a subsystem (see CONTEXT.md, Fase 4).
const listeners = new Set();
let stack = []; // [{ model, name }], one entry per level below the root

function notify() {
    const breadcrumb = ['Top', ...stack.map((entry) => entry.name)];
    listeners.forEach((fn) => fn(breadcrumb));
}

function switchTo(model) {
    Engine.setModel(model);
    Simulation.setModel(model);
    Engine.repaintCanvas();
}

function enterSubsystem(subsystemNode) {
    stack.push({ model: Engine.getModel(), name: subsystemNode.options?.name || 'Subsystem' });
    switchTo(subsystemNode.internalModel);
    notify();
}

function goBack() {
    if (stack.length === 0) return;
    const previous = stack.pop();
    switchTo(previous.model);
    notify();
}

function goToRoot() {
    if (stack.length === 0) return;
    const root = stack[0].model;
    stack = [];
    switchTo(root);
    notify();
}

function getBreadcrumb() {
    return ['Top', ...stack.map((entry) => entry.name)];
}

function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export { enterSubsystem, goBack, goToRoot, getBreadcrumb, subscribe };
