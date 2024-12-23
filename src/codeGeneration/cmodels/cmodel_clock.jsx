const ClockModel = function (node) {

    const outputVar = `${node.CGenUID}_output`;

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    this.addLib({
        name: "simClock",
        declaration: `void simClock(double* output, double* currentTime);`,
        implementation: `
            void simClock(double* output, double* currentTime) {
                *output = *currentTime;
            }
        `
    });

    // Adiciona variável compartilhada para a saída do clock
    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Clock no passo
    this.addStep(`simClock(&${outputVar}, &model->simulation.simulated_time)`);

    return outputVar;
};

export { ClockModel };
