// cmodel_min.jsx
const MinModel = function (node) {
    const varname = `var_${node.CGenUID}_min`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para `NAN`
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `min_block`
    this.addLibsC__functions(`
double min_block(const double* inputs, int count) {
    if (count <= 0) return 0;
    double min_val = inputs[0];
    for (int i = 1; i < count; i++) min_val = (min_val < inputs[i]) ? min_val : inputs[i];
    return min_val;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double min_block(const double* inputs, int count);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const min_param_var = this.addModelC__generateNewVar('min_param');
    this.addModelC__step(`double ${min_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = min_block(${min_param_var}, ${inputs.length});`);

    return varname;
};

export { MinModel };
