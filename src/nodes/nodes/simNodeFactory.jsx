import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { useModal } from '../../components/modal';
import { SimNodeModel } from './simNodeModel';
import { DisplayNodeWidget } from './displayNodeWidget';

// Factory: Esta classe é básica e permante
class SimNodeFactory extends AbstractReactFactory {
    constructor(type = 'sim-node') {
        super(type);
        this.type = type;
        
        // Add evento para monitorar os blocos
        window.addEventListener('keydown', event => this.handleKeyDown(event));
    }

    // Aqui inveter os nós selecionados
    handleKeyDown(event) {
        if (useModal.getShow)
            return
        const selectedEntities = this.engine.getModel().getSelectedEntities();
        switch(event.key){
            case 'i':
                selectedEntities.forEach((entity) => {
                    if ( typeof entity.flip === "boolean" ) {
                        entity.flip = !entity.flip
                        entity.update()
                    }
                })
                break
            case 'o':
                Array.isArray(selectedEntities) && 
                selectedEntities.filter(node => node.settings).map(node => node.settings())
        }
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