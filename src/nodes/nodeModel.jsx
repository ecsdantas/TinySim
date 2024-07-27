import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import { SimNodeModel } from './nodes/simNodeModel';
import { SimNodeFactory  } from './nodes/simNodeFactory';
import { SimLinkFactory } from './links/simLinkFactory';

// Cria o motor do diagrama e o Modelo
const Engine = createEngine();
Engine.getNodeFactories().registerFactory(new SimNodeFactory());
// Engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
Engine.getLinkFactories().registerFactory(new SimLinkFactory());
const Model = new DiagramModel();

Engine.setModel(Model);

export { Engine, Model, SimNodeModel }
