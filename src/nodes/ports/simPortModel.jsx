import { 
    DefaultPortModel, RightAngleLinkModel
} from '@projectstorm/react-diagrams';
import { SimLinkModel  } from '../links/simLinkModel';

// Modelo de fio quadrado
class SimPortModel extends DefaultPortModel {
    createLinkModel(){
        return new SimLinkModel()
    }
}

export { SimPortModel }