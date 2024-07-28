import createEngine, { DiagramModel, DefaultDiagramState, RightAngleLinkFactory  } from '@projectstorm/react-diagrams';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory  } from './nodes/simNodeFactory';

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();

const state = Engine.getStateMachine().getCurrentState();
if (state instanceof DefaultDiagramState) {
    state.dragNewLink.config.allowLooseLinks = false;
}

Engine.getNodeFactories().registerFactory(new SimNodeFactory());
Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());


const Model = new DiagramModel();

Engine.setModel(Model);

export { Engine, Model, SimNodeModel }
