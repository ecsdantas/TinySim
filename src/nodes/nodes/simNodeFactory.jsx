import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { SimNodeModel } from './simNodeModel';
import { DisplayNodeWidget } from './displayNodeWidget';

// Factory: Esta classe é básica e permante
class SimNodeFactory extends AbstractReactFactory {
    constructor(type = 'sim-node') {
        super(type);
        this.type = type;
    }

    generateModel() {
        return new SimNodeModel();
    }

    generateReactWidget(event) {
        return <DisplayNodeWidget node={ event.model } engine={ this.engine } />
    }

    // Permite salvar e resgatar o circuito
    // =======================================
    serialize() {
        return {
            ...super.serialize(),
            type: this.constructor.name,
            kind: this.kind,
            value: this.value
        };
    }

    deserialize(event) {
        super.deserialize(event);
        this.value = event.data.value || 0;
    }
    // =======================================
}

export { SimNodeFactory }