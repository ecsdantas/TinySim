const ZeroOrderModel = function (node) {

    const stateVar = `${node.CGenUID}_state`;
    const outputVar = `${node.CGenUID}_output`;
    const inputVar = this.getNode(node.getNodeByInput(0));
    const constantA = node.constantA || 1.0; // Constante 'a' em (s + a)

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)) {
        return outputVar;
    }
    node.isvisited = true;

    this.addLib({
        name: "zeroOrder",
        declaration: `void zeroOrder(double input, double* state, double* output, double constantA, double timestep);`,
        implementation: `
            void zeroOrder(double input, double* state, double* output, double constantA, double timestep) {
                double derivative = (input - *state) / timestep;
                *state = input;
                *output = derivative + constantA * input;
            }
        `
    });

    // Adiciona variável compartilhada para o estado e saída
    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: 0.0,
        type: 'static double'
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Zero Order no passo
    this.addStep(`zeroOrder(${inputVar}, &${stateVar}, &${outputVar}, ${constantA}, model->simulation.timestep)`);

    return outputVar;
};

export { ZeroOrderModel };
