// cmodel_step.jsx
const StepModel = function (node) {
    const varname = `var_${node.CGenUID}_step`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `simStep`
    this.addLibsC__functions(`
double simStep(double currentTime, double stepTime, double initialValue, double finalValue) {
    return (currentTime < stepTime) ? initialValue : finalValue;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double simStep(double currentTime, double stepTime, double initialValue, double finalValue);`);

    // Define os parâmetros
    const stepTime = node.stepTime ?? 1;
    const initialValue = node.initialValue ?? 0;
    const finalValue = node.finalValue ?? 1;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = simStep(model->simulation.simulated_time, ${stepTime}, ${initialValue}, ${finalValue});`);

    return varname;
};

export { StepModel };
