const AverageModel = function (node) {
    const inPorts = node.getInPorts();
    const varname = `var_${node.CGenUID}_${inPorts.length}`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "add",
        declaration: `double avg(const double* array, int size);`,
        implementation: `
            double avg(const double* array, int size) {
                double sum = 0.0;
                for (int i = 0; i < size; i++) { sum += array[i]; }
                return sum / size;
            }
        `
    });

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const add_param_var = this.createNewVar('avg_param');
    this.addStep(`double ${add_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = avg(${add_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { AverageModel };
