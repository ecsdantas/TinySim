import createEngine, { DiagramModel, DefaultDiagramState, RightAngleLinkFactory } from '@projectstorm/react-diagrams';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory } from './nodes/simNodeFactory';
import * as Elements from '../elements/index';
import { useModal } from '../components/modal';
import { RightAnglePortFactory } from '../nodes/ports/rightAngleFactory'

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();

// Permite algumas opções adicionais, como previnir fio sem ligação ponto-a-ponto
const state = Engine.getStateMachine().getCurrentState();
if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
}

// Registra todos os blocos para o caso de importação de diagrama
document.addEventListener('DOMContentLoaded', () => {
    Object.entries(Elements).forEach(([type, ModelClass]) => {
        class ElementNodeFactory extends SimNodeFactory {
            constructor() {
                super(type);
            }
            generateModel() {
                return new ModelClass();
            }
        }
        Engine.getNodeFactories().registerFactory(new ElementNodeFactory());
    });
    // console.log('Fábricas registradas:', Object.keys(Engine.getNodeFactories().factories));
});

// Registra demais blocos
Engine.getNodeFactories().registerFactory(new SimNodeFactory());
Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
Engine.getPortFactories().registerFactory(new RightAnglePortFactory());

const Model = new DiagramModel();

Engine.setModel(Model);


// Permite utilizar atalhos
const handleKeyDown = (event) => {  
        if (useModal.getShow)
            return
        const selectedEntities = Engine.getModel().getSelectedEntities();
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

    // Add evento para monitorar os blocos
window.addEventListener('keydown', event => handleKeyDown(event));


export { Engine, Model, SimNodeModel };


