// cmodel_add.jsx
const AddModel = function (node) {
    
    const varname = `var_${node.CGenUID}_add`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double add(const double* array, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) { sum += array[i]; }
    return sum;
} 
    `)

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double add(const double* array, int size);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const add_param_var = this.addModelC__generateNewVar('add_param');
    this.addModelC__step(`double ${add_param_var}[] = {${inputs.join(',')}};`);

    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = add(${add_param_var}, ${inputs.length});`);

    node.isvisited = true;

    return varname
}

export { AddModel };