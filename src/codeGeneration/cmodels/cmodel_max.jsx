// cmodel_max.jsx
const MaxModel = function (node) {
    const varname = `var_${node.CGenUID}_max`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para `NAN`
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `max_block`
    this.addLibsC__functions(`
double max_block(const double* inputs, int count) {
    if (count <= 0) return 0;
    double max_val = inputs[0];
    for (int i = 1; i < count; i++) max_val = (max_val > inputs[i]) ? max_val : inputs[i];
    return max_val;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double max_block(const double* inputs, int count);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const max_param_var = this.addModelC__generateNewVar('max_param');
    this.addModelC__step(`double ${max_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = max_block(${max_param_var}, ${inputs.length});`);

    return varname;
};

export { MaxModel };
