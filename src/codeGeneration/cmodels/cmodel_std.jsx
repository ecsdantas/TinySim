const StandardDeviationModel = function (node) {
    const inPorts = node.getInPorts();
    const varname = `var_${node.CGenUID}_${inPorts.length}`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "std_dev",
        declaration: `double std_dev(const double* array, int size);`,
        implementation: `
            double std_dev(const double* array, int size) {
                if (size <= 1) return 0.0;
                double mean = 0.0, variance = 0.0;
                for (int i = 0; i < size; i++) {
                    mean += array[i];
                }
                mean /= size;
                for (int i = 0; i < size; i++) {
                    variance += (array[i] - mean) * (array[i] - mean);
                }
                variance /= size;
                return sqrt(variance);
            }
        `
    });

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const std_dev_param_var = this.createNewVar('std_dev_param');
    this.addStep(`double ${std_dev_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = std_dev(${std_dev_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { StandardDeviationModel };
