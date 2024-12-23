const MemoryModel = function (node) {

    const stateVar = `${node.CGenUID}_state`;
    const outputVar = `${node.CGenUID}_output`;
    const inputVar = this.getNode(node.getNodeByInput(0));

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)) {
        return outputVar;
    }
    node.isvisited = true;

    this.addLib({
        name: "memory",
        declaration: `void memory(double input, double* state, double* output);`,
        implementation: `
            void memory(double input, double* state, double* output) {
                *output = *state;
                *state = input;
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: node.initialValue || 0.0,
        type: 'static double'
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Memory no passo
    this.addStep(`memory(${inputVar}, &${stateVar}, &${outputVar})`);

    return outputVar;
};

export { MemoryModel };
