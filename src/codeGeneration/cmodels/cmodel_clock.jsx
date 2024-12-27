// cmodel_clock.jsx
const ClockModel = function (node) {
    const varname = `var_${node.CGenUID}_clock`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
void simClock(double* output, double* currentTime) {
    *output = *currentTime;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void simClock(double* output, double* currentTime);`);

    // Adiciona a variável de saída para o Clock
    this.addModelC__vars(`double ${varname};`);

    // Adiciona a chamada ao modelo Clock no passo
    this.addModelC__step(`simClock(&${varname}, &model->simulation.simulated_time);`);

    return varname;
};

export { ClockModel };
