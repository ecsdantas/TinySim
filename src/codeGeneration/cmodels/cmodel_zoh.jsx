const ZOHModel = function (node) {
    
    const stateVar = `${node.CGenUID}_state`;
    const sampleTime = node.sampleTime || 1.0; // Tempo de amostragem

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === stateVar)) {
        return `${node.CGenUID}_output`;
    }
    node.isvisited = true;

    this.addLib({
        name: "zoh",
        declaration: `void zoh(double input, double* state, double* output, double sampleTime, double* currentTime);`,
        implementation: `
            void zoh(double input, double* state, double* output, double sampleTime, double* currentTime) {
                static double lastUpdateTime = 0.0;
                if (fmod(*currentTime, sampleTime) < 1e-6) {
                    *state = input;
                    lastUpdateTime = *currentTime;
                }
                *output = *state;
            }
        `
    });

    // Adiciona a biblioteca math.h por conta do NAN
    this.addIncludeLib('<math.h>')


    this.addSharedModelVar({
        ref: node.CGenUID,
        name: stateVar,
        value: 0.0,
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

    // Adiciona a chamada ao modelo ZOH no passo
    this.addStep(`zoh(${input}, &${stateVar}, &${outputVar}, ${sampleTime}, &model->simulation.simulated_time)`);

    return outputVar;
};

export { ZOHModel };
