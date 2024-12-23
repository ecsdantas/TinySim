const FirstOrderModel = function (node) {
    
    const stateVar = `${node.CGenUID}_state`;
    const dampingFactor = node.dampingFactor || 1.0; // Fator de amortecimento (a)

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)) {
        return `${node.CGenUID}_output`;
    }
    node.isvisited = true;

    this.addLib({
        name: "firstOrder",
        declaration: `void firstOrder(double input, double* state, double* output, double dampingFactor, double* timestep);`,
        implementation: `
            void firstOrder(double input, double* state, double* output, double dampingFactor, double* timestep) {
                *state += (input - dampingFactor * *state) * *timestep;
                *output = *state;
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: node.initialValue || 0.0,
        type: 'static double'
    });

    const input = this.getNode(node.getNodeByInput(0));
    const outputVar = `${node.CGenUID}_output`;

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo de primeira ordem no passo
    this.addStep(`firstOrder(${input}, &${stateVar}, &${outputVar}, ${dampingFactor}, &model->simulation.sampling_time)`);

    return outputVar;
};

export { FirstOrderModel };