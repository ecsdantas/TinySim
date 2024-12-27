// cmodel_first_order.jsx
const FirstOrderModel = function (node) {
    const stateVar = `var_${node.CGenUID}_state`;
    const outputVar = `var_${node.CGenUID}_output`;
    const dampingFactor = node.dampingFactor || 1.0; // Fator de amortecimento (a)

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `firstOrder`
    this.addLibsC__functions(`
void firstOrder(double input, double* state, double* output, double dampingFactor, double* timestep) {
    *state += (input - dampingFactor * *state) * *timestep;
    *output = *state;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void firstOrder(double input, double* state, double* output, double dampingFactor, double* timestep);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${stateVar} = ${node.initialValue || 0.0};`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo de primeira ordem no passo de execução
    this.addModelC__step(`firstOrder(${input}, &${stateVar}, &${outputVar}, ${dampingFactor}, &model->simulation.sampling_time);`);

    return outputVar;
};

export { FirstOrderModel };
