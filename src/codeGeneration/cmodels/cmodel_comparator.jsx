const RelationalOperatorModel = function (node) {
    const varname = `var_${node.CGenUID}_comparator`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLib({
        name: "comparator",
        declaration: `int compare_values(double value1, double value2, const char* operator);`,
        implementation: `
            #include <string.h>

            int compare_values(double value1, double value2, const char* operator) {
                if (strcmp(operator, "greaterThanOrEqual") == 0) return value1 >= value2;
                if (strcmp(operator, "greaterThan") == 0) return value1 > value2;
                if (strcmp(operator, "equal") == 0) return value1 == value2;
                if (strcmp(operator, "lowerThanOrEqual") == 0) return value1 <= value2;
                if (strcmp(operator, "lowerThan") == 0) return value1 < value2;
                if (strcmp(operator, "different") == 0) return value1 != value2;
                return 0; // Default case
            }
        `
    });

    // Recupera os nós conectados como entradas
    const input1 = this.getNode(node.getNodeByInput(0));
    const input2 = this.getNode(node.getNodeByInput(1));

    // Define o operador
    const operator = `"${node.operator}"`;

    // Cria a declaração e o cálculo da variável
    this.addStep(`int ${varname} = compare_values(${input1}, ${input2}, ${operator})`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { RelationalOperatorModel };
