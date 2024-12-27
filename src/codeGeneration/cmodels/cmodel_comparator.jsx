// cmodel_relational_operator.jsx
const RelationalOperatorModel = function (node) {
    const varname = `var_${node.CGenUID}_comparator`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona o include necessário
    this.addLibsH__include('#include <string.h>');

    // Adiciona a implementação da função
    this.addLibsC__functions(`
int compare_values(double value1, double value2, const char* operator) {
    if (strcmp(operator, "greaterThanOrEqual") == 0) return value1 >= value2;
    if (strcmp(operator, "greaterThan") == 0) return value1 > value2;
    if (strcmp(operator, "equal") == 0) return value1 == value2;
    if (strcmp(operator, "lowerThanOrEqual") == 0) return value1 <= value2;
    if (strcmp(operator, "lowerThan") == 0) return value1 < value2;
    if (strcmp(operator, "different") == 0) return value1 != value2;
    return 0; // Default case
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`int compare_values(double value1, double value2, const char* operator);`);

    // Recupera os nós conectados como entradas
    const input1 = this.getNode(node.getNodeByInput(0));
    const input2 = this.getNode(node.getNodeByInput(1));

    // Define o operador
    const operator = `"${node.operator}"`;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`int ${varname};`);
    this.addModelC__step(`${varname} = compare_values(${input1}, ${input2}, ${operator});`);

    return varname;
};

export { RelationalOperatorModel };
