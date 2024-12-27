// cmodel_zero_order.jsx
const ZeroOrderModel = function (node) {
    const stateVar = `var_${node.CGenUID}_state`;
    const outputVar = `var_${node.CGenUID}_output`;
    const constantA = node.constantA || 1.0; // Constante 'a' em (s + a)

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `zeroOrder`
    this.addLibsC__functions(`
void zeroOrder(double input, double* state, double* output, double constantA, double* timestep) {
    double derivative = (input - *state) / *timestep;
    *state = input;
    *output = derivative + constantA * input;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void zeroOrder(double input, double* state, double* output, double constantA, double* timestep);`);

    // Recupera o nó conectado como entrada
    const inputVar = this.getNode(node.getNodeByInput(0));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${stateVar} = 0.0;`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo Zero Order no passo de execução
    this.addModelC__step(`zeroOrder(${inputVar}, &${stateVar}, &${outputVar}, ${constantA}, &model->simulation.sampling_time);`);

    return outputVar;
};

export { ZeroOrderModel };
