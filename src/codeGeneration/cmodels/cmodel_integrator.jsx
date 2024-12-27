// cmodel_integrator.jsx
const IntegratorModel = function (node) {
    const stateVar = `var_${node.CGenUID}_state`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return stateVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `integrator`
    this.addLibsC__functions(`
void integrator(double input, double* state, double* timestep) {
    *state += input * *timestep;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void integrator(double input, double* state, double* timestep);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Cria a variável de estado
    this.addModelC__vars(`static double ${stateVar} = ${node.initialValue || 0.0};`);

    // Adiciona a chamada ao modelo Integrator no passo de execução
    this.addModelC__step(`integrator(${input}, &${stateVar}, &model->simulation.sampling_time);`);

    return stateVar;
};

export { IntegratorModel };
