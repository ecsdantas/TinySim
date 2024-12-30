const AndModel = function (node) {

    const varname = `var_${node.CGenUID}_and`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <stddef.h>');

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double and_operation(const double* array, size_t size) {
    char result = 1;
    for (size_t i = 0; i < size; i++) { result *= (array[i]>0); }
    return result? 1.0 : 0.0;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double and_operation(const double* array, size_t size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const and_param_var = this.addModelC__generateNewVar('and_param');
    this.addModelC__step(`double ${and_param_var}[] = {${inputs.join(',')}};`);

    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = and_operation(${and_param_var}, ${inputs.length});`);

    node.isvisited = true;

    return varname;
}

export { AndModel };
