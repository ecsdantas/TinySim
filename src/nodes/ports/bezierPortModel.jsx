import { DefaultPortModel } from '@projectstorm/react-diagrams';
import { BezierLinkModel } from '../links/bezierLinks';

// Define um modelo de porta personalizado
class BezierPortModel extends DefaultPortModel {
    constructor(options = {}) {
        super({
            ...options,
            type: 'bezier-port', // Define o tipo personalizado
        });
    }

    // Define se esta porta pode se conectar a outra
    canLinkToPort(port) {
        // Permitir conexões para todas as portas por padrão
        return true;
    }

    // Define o modelo de link que será criado
    createLinkModel(factory) {
        // Força a criação de links do tipo Bézier
        return new BezierLinkModel();
    }
    
}

export { BezierPortModel };
