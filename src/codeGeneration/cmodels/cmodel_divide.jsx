const DivideModel = function (node) {
    const inPorts = node.getInPorts();
    const varname = `var_${node.CGenUID}_${inPorts.length}`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "divide",
        declaration: `double divide(const double* array, int size);`,
        implementation: `
            double divide(const double* array, int size) {
                double result = array[0];
                for (int i = 1; i < size; i++) {
                    if (array[i] == 0) return NAN; // Avoid division by zero
                    result /= array[i];
                }
                return result;
        }`
    });

    // Adiciona a biblioteca math.h por conta do NAN
    this.addIncludeLib('<math.h>')

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const add_param_var = this.createNewVar('div_param');
    this.addStep(`double ${add_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = divide(${add_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { DivideModel };
