const SaturationModel = function (node) {
    const inPort = node.getInPorts()[0];
    const varname = `var_${node.CGenUID}_saturation`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "saturation",
        declaration: `double saturate_value(double value, double min_val, double max_val);`,
        implementation: `
            double saturate_value(double value, double min_val, double max_val) {
                if (value < min_val) return min_val;
                if (value > max_val) return max_val;
                return value;
            }
        `
    });

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Define os parâmetros
    const minValue = node.MinValue || 0;
    const maxValue = node.MaxValue || 10;

    // Cria a declaração e o cálculo da variável
    this.addStep(`double ${varname} = saturate_value(${input}, ${minValue}, ${maxValue})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { SaturationModel };
