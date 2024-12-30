const NorModel = function (node) {

    const varname = `var_${node.CGenUID}_nor`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <stddef.h>');

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double nor_operation(const double* array, size_t size) {
    double result = 0;
    for (size_t i = 0; i < size; i++) { result = result || (array[i]>0); }
    return result? 0.0 : 1.0;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double nor_operation(const double* array, size_t size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const nor_param_var = this.addModelC__generateNewVar('nor_param');
    this.addModelC__step(`int ${nor_param_var}[] = {${inputs.join(',')}};`);

    this.addModelC__vars(`int ${varname};`);
    this.addModelC__step(`${varname} = nor_operation(${nor_param_var}, ${inputs.length});`);

    node.isvisited = true;

    return varname;
}

export { NorModel };
