const DerivatorModel = function (node) {

    const stateVar = `${node.CGenUID}_previousInput`;

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)) {
        return `${node.CGenUID}_derivative`;
    }
    node.isvisited = true;

    this.addLib({
        name: "derivator",
        declaration: `void derivator(double input, double* previousInput, double* output, double* timestep);`,
        implementation: `
            void derivator(double input, double* previousInput, double* output, double* timestep) {
                *output = (input - *previousInput) / *timestep;
                *previousInput = input;
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: 0.0,
        type: 'static double'
    });

    const input = this.getNode(node.getNodeByInput(0));
    const derivativeVar = `${node.CGenUID}_derivative`;

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: derivativeVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao derivador no passo
    this.addStep(`derivator(${input}, &${stateVar}, &${derivativeVar}, &model->simulation.sampling_time)`);

    return derivativeVar;
};

export { DerivatorModel };
