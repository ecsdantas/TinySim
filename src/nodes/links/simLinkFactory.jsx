import { DefaultLinkFactory } from '@projectstorm/react-diagrams-defaults';
import { SimLinkModel } from './simLinkModel'; // Adjust the path accordingly
import { SimLinkWidget } from './simLinkWidget';

class SimLinkFactory extends DefaultLinkFactory {
	
	constructor() {
		super('sim-link');
	}

	generateModel(event) {
		return new SimLinkModel();
	}

	generateReactWidget(event) {
		return <SimLinkWidget diagramEngine={this.engine} link={event.model} factory={this} />;
	}
	
}

export { SimLinkFactory }