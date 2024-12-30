import createEngine, { DiagramModel, DefaultDiagramState, RightAngleLinkFactory } from '@projectstorm/react-diagrams';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory } from './nodes/simNodeFactory';
import * as Elements from '../elements/index';
import { useModal } from '../components/modal';
import { RightAnglePortFactory } from '../nodes/ports/rightAngleFactory'
import Simulation from '../simulation/core';

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();
const ModelsArray = {};
const MousePosition = { x: 0, y: 0 }

// Permite algumas opções adicionais, como previnir fio sem ligação ponto-a-ponto
const state = Engine.getStateMachine().getCurrentState();
if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
}

// Monitora a posição do mouse
document.addEventListener("mousemove", (event) => {
    MousePosition.x = event.clientX;
    MousePosition.y = event.clientY;
});

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
        ModelsArray[type] = ModelClass;
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
            
            case 'c':
            if (event.ctrlKey) {
                const nodes = [];
                selectedEntities.filter(entity => entity.CGenUID).forEach((entity) => {
                    nodes.push(entity.constructor.name);
                });
                sessionStorage.setItem("blocks", `[${nodes.map(n => `"${n}"`).join(",")}]`);
            }
            break

            case 'v':
            if (event.ctrlKey) {
                const modelNames = JSON.parse(sessionStorage.getItem("blocks"));
                const EngModel = Engine.getModel()
                const canvasRect = event.target.getBoundingClientRect();
                modelNames.forEach((modelName, index) => {
                    const newNode = new ModelsArray[modelName]();
                    newNode.setPosition(
                        MousePosition.x - canvasRect.left - newNode.width / 2 + 50 * index,
                        MousePosition.y - canvasRect.top - newNode.height / 2 + 50 * index
                    );

                    // Cria IDs unicos
                    const existingUIDs = new Set(Model.getNodes().map(n => n.CGenUID));
                    let i = 0;
                    while (existingUIDs.has(newNode.CGenUID + i)) {
                        i++;
                    }
                    newNode.CGenUID += i;
                    EngModel.addNode(newNode)
                })

                Engine.repaintCanvas()
                Simulation.setModel(EngModel);

            }
            break

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
