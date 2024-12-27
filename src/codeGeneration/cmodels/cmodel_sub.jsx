// cmodel_subtract.jsx
const SubModel = function (node) {
    const varname = `var_${node.CGenUID}_sub`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `sub`
    this.addLibsC__functions(`
double sub(const double* array, int size) {
    double sum = array[0];
    for (int i = 1; i < size; i++) { sum -= array[i]; }
    return sum;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double sub(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const sub_param_var = this.addModelC__generateNewVar('sub_param');
    this.addModelC__step(`double ${sub_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = sub(${sub_param_var}, ${inputs.length});`);

    return varname;
};

export { SubModel };
