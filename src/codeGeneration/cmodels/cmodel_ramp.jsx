// cmodel_ramp.jsx
const RampModel = function (node) {
    const varname = `var_${node.CGenUID}_ramp`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `simRamp`
    this.addLibsC__functions(`
double simRamp(double currentTime, double slope, double startTime, double initialOutput) {
    if (currentTime < startTime) return initialOutput;
    return initialOutput + slope * (currentTime - startTime);
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double simRamp(double currentTime, double slope, double startTime, double initialOutput);`);

    // Define os parâmetros
    const slope = node.slope ?? 1;
    const startTime = node.startTime ?? 0;
    const initialOutput = node.initialOutput ?? 0;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = simRamp(model->simulation.simulated_time, ${slope}, ${startTime}, ${initialOutput});`);

    return varname;
};

export { RampModel };
