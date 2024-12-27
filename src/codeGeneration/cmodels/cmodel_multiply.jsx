// cmodel_multiply.jsx
const MultiplyModel = function (node) {
    const varname = `var_${node.CGenUID}_multiply`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `multiply`
    this.addLibsC__functions(`
double multiply(const double* array, int size) {
    double result = array[0];
    for (int i = 1; i < size; i++) {
        result *= array[i];
    }
    return result;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double multiply(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const mult_param_var = this.addModelC__generateNewVar('mult_param');
    this.addModelC__step(`double ${mult_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = multiply(${mult_param_var}, ${inputs.length});`);

    return varname;
};

export { MultiplyModel };
