// cmodel_pulseGenerator.jsx
const PulseGeneratorModel = function (node) {
    const varname = `var_${node.CGenUID}_pulse`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `simPulseGenerator`
    this.addLibsC__functions(`
double simPulseGenerator(double currentTime, double amplitude, double period, double pulseWidth, double phaseDelay) {
    if (currentTime < phaseDelay || period <= 0) return 0;
    double elapsed = fmod(currentTime - phaseDelay, period);
    double onTime = (pulseWidth / 100.0) * period;
    return (elapsed < onTime) ? amplitude : 0;
}
    `);

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <math.h>');

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double simPulseGenerator(double currentTime, double amplitude, double period, double pulseWidth, double phaseDelay);`);

    // Define os parâmetros
    const amplitude = node.amplitude ?? 1;
    const period = node.period ?? 1;
    const pulseWidth = node.pulseWidth ?? 50;
    const phaseDelay = node.phaseDelay ?? 0;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = simPulseGenerator(model->simulation.simulated_time, ${amplitude}, ${period}, ${pulseWidth}, ${phaseDelay});`);

    return varname;
};

export { PulseGeneratorModel };
