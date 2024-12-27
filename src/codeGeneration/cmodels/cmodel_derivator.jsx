// cmodel_derivator.jsx
const DerivatorModel = function (node) {
    const stateVar = `var_${node.CGenUID}_previousInput`;
    const derivativeVar = `var_${node.CGenUID}_derivative`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return derivativeVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `derivator`
    this.addLibsC__functions(`
void derivator(double input, double* previousInput, double* output, double* timestep) {
    *output = (input - *previousInput) / *timestep;
    *previousInput = input;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void derivator(double input, double* previousInput, double* output, double* timestep);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${stateVar} = 0.0;`);
    this.addModelC__vars(`double ${derivativeVar};`);

    // Adiciona a chamada ao modelo Derivator no passo de execução
    this.addModelC__step(`derivator(${input}, &${stateVar}, &${derivativeVar}, &model->simulation.sampling_time);`);

    return derivativeVar;
};

export { DerivatorModel };
