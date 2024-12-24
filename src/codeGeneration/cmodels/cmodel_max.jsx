const MaxModel = function (node) {
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
        name: "max",
        declaration: `double max_block(const double* inputs, int count);`,
        implementation: `
            double max_block(const double* inputs, int count) {
                if (count <= 0) return 0;
                double max_val = inputs[0];
                for (int i = 1; i < count; i++) max_val = (max_val > inputs[i])? max_val : inputs[i];
                return max_val;
            }
        `
    });

    // Recupera os nós conectados como entradas
    const inputs = inPorts.map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Cria uma nova variável para os parâmetros do método
    const max_param_var = this.createNewVar('max_param');
    this.addStep(`double ${max_param_var}[] = {${inputs.join(',')}}`);
    this.addStep(`double ${varname} = max_block(${max_param_var}, ${inputs.length})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { MaxModel };