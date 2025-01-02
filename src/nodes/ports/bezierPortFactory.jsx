import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { RightAnglePortModel } from './rightAnglePortModel';
import { BezierPortModel } from './bezierPortModel';

class BezierPortFactory extends AbstractReactFactory {
    constructor() {
        super('bezier-port');
    }

    generateModel() {
        return new BezierPortModel();
    }
}

export { BezierPortFactory }