import { DiagramModel, RightAngleLinkFactory } from '@projectstorm/react-diagrams';
import { Engine } from './engine';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory } from './nodes/simNodeFactory';
import * as Elements from '../elements/index';
import { useModal } from '../components/modal';
import { RightAnglePortFactory } from '../nodes/ports/rightAngleFactory';
import Simulation from '../simulation/core';
import { SelectionBox } from './selection/mouse';
import Stack from './stack/stack';
import { toast } from 'react-toastify';
import BezierLinkFactory from './links/bezierLinkFactory';
import { BezierPortFactory } from './ports/bezierPortFactory';

const ModelsArray = {}; // Armazena modelos registrados com identificadores únicos
const MousePosition = { x: 0, y: 0 };

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
    // Passa os parâmetros necessários para o SelectionBox
    SelectionBox()

});

// Registra demais blocos
Engine.getNodeFactories().registerFactory(new SimNodeFactory());
Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
Engine.getLinkFactories().registerFactory(new BezierLinkFactory());
Engine.getPortFactories().registerFactory(new RightAnglePortFactory());
Engine.getPortFactories().registerFactory(new BezierPortFactory());

// Cria o digrama e o modelo
const Model = new DiagramModel();
Engine.setModel(Model);

// Permite fazer o Undo e Redos
// const stackManager = new Stack(Engine, Simulation);

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

        case 'x':
            // event.ctrlKey && stackManager.redoLastAction();
            break;

        case 'z':
            // event.ctrlKey && !event.shiftKey && stackManager.undoLastAction();
            // event.ctrlKey && event.shiftKey && stackManager.redoLastAction();
            event.ctrlKey && toast.warning("We don't have undo or redo. Sorry")
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

        case ' ':
            event.preventDefault();
            Engine.zoomToFitSelectedNodes({ margin: 50 });
            Engine.repaintCanvas();
            break;
    }
};

// Adiciona evento para monitorar os blocos
window.addEventListener('keydown', event => handleKeyDown(event));

export { Engine, Model, SimNodeModel };