import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import BezierLinkWidget from './bezierWidget';
import { BezierLinkModel } from './bezierLinks';

class BezierLinkFactory extends DefaultLinkFactory {
    constructor() {
        super('bezier');
    }

    generateModel() {
        return new BezierLinkModel();
    }
    
    generateReactWidget(event) {
        return <BezierLinkWidget link={event.model} />;
    }

}


export default BezierLinkFactory;