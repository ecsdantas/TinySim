import createEngine, { DiagramModel, DefaultDiagramState, RightAngleLinkFactory } from '@projectstorm/react-diagrams';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory } from './nodes/simNodeFactory';
import * as Elements from '../elements/index';
import { useModal } from '../components/modal';
import { RightAnglePortFactory } from '../nodes/ports/rightAngleFactory';
import Simulation from '../simulation/core';
import { SelectionBox } from './selection/mouse';
import Stack from './stack/stack';


// Cria o motor do diagrama e o Modelo
const Engine = createEngine();
const ModelsArray = {}; // Armazena modelos registrados com identificadores únicos
const MousePosition = { x: 0, y: 0 };

// Permite algumas opções adicionais, como previnir fio sem ligação ponto-a-ponto
const state = Engine.getStateMachine().getCurrentState();
if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
    state.dragCanvas.config.allowDrag = false; // Desativa "pan"
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
        
        // Adiciona o identificador único ao modelo
        ModelClass.modelIdentifier = type;

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

// Permite fazer o Undo e Redos
const stackManager = new Stack(Engine, Simulation);


// Passa os parâmetros necessários para o SelectionBox
SelectionBox()

// Permite utilizar atalhos
const handleKeyDown = (event) => {  
    if (useModal.getShow)
        return;
    const selectedEntities = Engine.getModel().getSelectedEntities();
    switch (event.key) {

        case 'c':
            if (event.ctrlKey) {
                const nodes = [];
                selectedEntities.filter(entity => entity.CGenUID).forEach((entity) => {
                    nodes.push(entity.constructor.modelIdentifier); // Usa o identificador único
                });
                sessionStorage.setItem("blocks", JSON.stringify(nodes));
            }
            break;

        case 'v':
            if (event.ctrlKey) {
                const modelIdentifiers = JSON.parse(sessionStorage.getItem("blocks"));
                const EngModel = Engine.getModel();
                const canvasRect = event.target.getBoundingClientRect();
                modelIdentifiers.forEach((modelIdentifier, index) => {
                    const ModelClass = ModelsArray[modelIdentifier];
                    const newNode = new ModelClass();
                    newNode.setPosition(
                        MousePosition.x - canvasRect.left - newNode.width / 2 + 50 * index,
                        MousePosition.y - canvasRect.top - newNode.height / 2 + 50 * index
                    );

                    // Cria IDs únicos
                    const existingUIDs = new Set(Model.getNodes().map(n => n.CGenUID));
                    let i = 0;
                    while (existingUIDs.has(newNode.CGenUID + i)) {
                        i++;
                    }
                    newNode.CGenUID += i;
                    EngModel.addNode(newNode);
                });

                Engine.repaintCanvas();
                Simulation.setModel(EngModel);
            }
            break;

        case 'i':
            selectedEntities.forEach((entity) => {
                if (typeof entity.flip === "boolean") {
                    entity.flip = !entity.flip;
                    entity.update();
                }
            });
            break;

        case 'o':
            Array.isArray(selectedEntities) && 
            selectedEntities.filter(node => node.settings).forEach(node => node.settings());
            break;

        case 'y':
            event.ctrlKey && stackManager.redoLastAction();
            break;

        case 'z':
            event.ctrlKey && stackManager.undoLastAction();
            break;

        case '3':
            event.altKey && Simulation.resetSimulation()
            break;

        case '2':
            event.altKey && Simulation.runStep()
            break;
    
        case '1':
            event.altKey && Simulation.run()
            break;
    }
};

// Adiciona evento para monitorar os blocos
window.addEventListener('keydown', event => handleKeyDown(event));

export { Engine, Model, SimNodeModel };