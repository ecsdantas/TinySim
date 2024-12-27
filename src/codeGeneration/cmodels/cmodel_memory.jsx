// cmodel_memory.jsx
const MemoryModel = function (node) {
    const stateVar = `var_${node.CGenUID}_state`;
    const outputVar = `var_${node.CGenUID}_output`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `memory`
    this.addLibsC__functions(`
void memory(double input, double* state, double* output) {
    *output = *state;
    *state = input;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void memory(double input, double* state, double* output);`);

    // Recupera o nó conectado como entrada
    const inputVar = this.getNode(node.getNodeByInput(0));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${stateVar} = ${node.initialValue || 0.0};`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo Memory no passo de execução
    this.addModelC__step(`memory(${inputVar}, &${stateVar}, &${outputVar});`);

    return outputVar;
};

export { MemoryModel };
