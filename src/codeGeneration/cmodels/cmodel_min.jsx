const MinModel = function (node) {
    const inPorts = node.getInPorts();
    const varname = `var_${node.CGenUID}_${inPorts.length}`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca math.h por conta do NAN
    this.addIncludeLib('<math.h>')

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "min",
        declaration: `double min_block(const double* inputs, int count);`,
        implementation: `
            double min_block(const double* inputs, int count) {
                if (count <= 0) return 0;
                double min_val = inputs[0];
                for (int i = 1; i < count; i++) min_val = (min_val < inputs[i])? min_val : inputs[i];
                return min_val;
            }
        `
    });

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const min_param_var = this.createNewVar('min_param');
    this.addStep(`double ${min_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = min_block(${min_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { MinModel };
