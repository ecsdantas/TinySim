// cmodel_sineWave.jsx
const SineWaveModel = function (node) {
    const varname = `var_${node.CGenUID}_sine`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `simSineWave`
    this.addLibsC__functions(`
double simSineWave(double currentTime, double amplitude, double frequency, double phase, double bias) {
    return amplitude * sin(frequency * currentTime + phase) + bias;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double simSineWave(double currentTime, double amplitude, double frequency, double phase, double bias);`);

    // Define os parâmetros
    const amplitude = node.amplitude ?? 1;
    const frequency = node.frequency ?? 1;
    const phase = node.phase ?? 0;
    const bias = node.bias ?? 0;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = simSineWave(model->simulation.simulated_time, ${amplitude}, ${frequency}, ${phase}, ${bias});`);

    return varname;
};

export { SineWaveModel };
