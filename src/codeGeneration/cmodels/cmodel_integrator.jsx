const IntegratorModel = function (node) {
    
    const stateVar = `${node.CGenUID}_state`;

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)){
        // Add uma variável de inicialização no init
        return stateVar;
    }
    node.isvisited = true
    
    this.addLib({
        name: "integrator",
        declaration: `void integrator(double input, double* state, double* timestep);`,
        implementation: `
            void integrator(double input, double* state, double* timestep) {
                *state += input * *timestep;
            }
        `
    });
    
    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: node.initialValue,
        type: 'static double'
    })
    
    const input = this.getNode(node.getNodeByInput(0));
    
    // Inicialização do estado
    this.addStep(`integrator(${input}, &${stateVar}, &model->simulation.sampling_time)`);
    
    return stateVar;
};


export { IntegratorModel };