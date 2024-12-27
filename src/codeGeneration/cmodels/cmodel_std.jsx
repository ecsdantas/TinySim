// cmodel_standard_deviation.jsx
const StandardDeviationModel = function (node) {
    const varname = `var_${node.CGenUID}_std_dev`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `std_dev`
    this.addLibsC__functions(`
double std_dev(const double* array, int size) {
    if (size <= 1) return 0.0;
    double mean = 0.0, variance = 0.0;
    for (int i = 0; i < size; i++) {
        mean += array[i];
    }
    mean /= size;
    for (int i = 0; i < size; i++) {
        variance += (array[i] - mean) * (array[i] - mean);
    }
    variance /= size;
    return sqrt(variance);
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double std_dev(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const std_dev_param_var = this.addModelC__generateNewVar('std_dev_param');
    this.addModelC__step(`double ${std_dev_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = std_dev(${std_dev_param_var}, ${inputs.length});`);

    return varname;
};

export { StandardDeviationModel };
