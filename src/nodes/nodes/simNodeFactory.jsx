import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { useModal } from '../../components/modal';
import { SimNodeModel } from './simNodeModel';
import { DisplayNodeWidget } from './displayNodeWidget';

// Factory: Esta classe é básica e permante
class SimNodeFactory extends AbstractReactFactory {
    constructor() {
        super('sim-node');
        
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
}

export { SimNodeFactory }