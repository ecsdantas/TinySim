const MultiplyModel = function (node) {
    const inPorts = node.getInPorts();
    const varname = `var_${node.CGenUID}_${inPorts.length}`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "multiply",
        declaration: `double multiply(const double* array, int size);`,
        implementation: `
            double multiply(const double* array, int size) {
                double result = array[0];
                for (int i = 1; i < size; i++) {
                    result *= array[i];
                }
                return result;
            }`
    });

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const add_param_var = this.createNewVar('mult_param');
    this.addStep(`double ${add_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = multiply(${add_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { MultiplyModel };
