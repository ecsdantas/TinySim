import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { RightAnglePortModel } from './rightAnglePortModel';

class RightAnglePortFactory extends AbstractReactFactory {
    constructor() {
        super('right-angle-port');
    }

    generateModel() {
        return new RightAnglePortModel();
    }
}

export { RightAnglePortFactory }