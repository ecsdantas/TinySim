// cmodel_divide.jsx
const DivideModel = function (node) {
    const varname = `var_${node.CGenUID}_divide`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para `NAN`
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `divide`
    this.addLibsC__functions(`
double divide(const double* array, int size) {
    double result = array[0];
    for (int i = 1; i < size; i++) {
        if (array[i] == 0) return NAN; // Avoid division by zero
        result /= array[i];
    }
    return result;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double divide(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const div_param_var = this.addModelC__generateNewVar('div_param');
    this.addModelC__step(`double ${div_param_var}[] = {${inputs.join(',')}};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = divide(${div_param_var}, ${inputs.length});`);

    return varname;
};

export { DivideModel };
