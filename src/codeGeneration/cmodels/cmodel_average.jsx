// cmodel_average.jsx
const AverageModel = function (node) {
    const varname = `var_${node.CGenUID}_average`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função de cálculo da média
    this.addLibsC__functions(`
double avg(const double* array, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) { sum += array[i]; }
    return sum / size;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double avg(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const avg_param_var = this.addModelC__generateNewVar('avg_param');
    this.addModelC__step(`double ${avg_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = avg(${avg_param_var}, ${inputs.length});`);

    return varname;
};

export { AverageModel };
