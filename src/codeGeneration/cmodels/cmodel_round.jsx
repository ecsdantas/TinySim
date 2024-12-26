const RoundModel = function (node) {
    const inPort = node.getInPorts()[0];
    const varname = `var_${node.CGenUID}_round`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca math.h por conta do exp
    this.addIncludeLib('<math.h>')
    this.addIncludeLib('<string.h>')

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "round",
        declaration: `double round_value(double value, int decimal_places, const char* round_type);`,
        implementation: `
            double round_value(double value, int decimal_places, const char* round_type) {
                double factor = pow(10, decimal_places);
                if (strcmp(round_type, "ceil") == 0) {
                    return ceil(value * factor) / factor;
                } else if (strcmp(round_type, "floor") == 0) {
                    return floor(value * factor) / factor;
                } else {
                    return round(value * factor) / factor;
                }
            }
        `
    });

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Define os parâmetros
    const decimalPlaces = node.decimalPlaces || 0;
    const roundType = `"${node.roundType}"`;

    // Cria a declaração e o cálculo da variável
    this.addStep(`double ${varname} = round_value(${input}, ${decimalPlaces}, ${roundType})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { RoundModel };
