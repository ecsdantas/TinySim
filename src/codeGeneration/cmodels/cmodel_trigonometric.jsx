// cmodel_trigonometric.jsx
const TrigonometricModel = function (node) {
    const varname = `var_${node.CGenUID}_trig`;
    const functionType = node.functionType || 'sin';

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <math.h>');
    this.addLibsH__include('#include <string.h>');

    // Adiciona a implementação da função `trigonometric`
    this.addLibsC__functions(`
double trigonometric(double value, const char* functionType) {
    if (strcmp(functionType, "sin") == 0) { return sin(value); }
    if (strcmp(functionType, "cos") == 0) { return cos(value); }
    if (strcmp(functionType, "tan") == 0) { return tan(value); }
    if (strcmp(functionType, "asin") == 0) { return asin(value); }
    if (strcmp(functionType, "acos") == 0) { return acos(value); }
    if (strcmp(functionType, "atan") == 0) { return atan(value); }
    if (strcmp(functionType, "sinh") == 0) { return sinh(value); }
    if (strcmp(functionType, "cosh") == 0) { return cosh(value); }
    if (strcmp(functionType, "tanh") == 0) { return tanh(value); }
    if (strcmp(functionType, "asinh") == 0) { return asinh(value); }
    if (strcmp(functionType, "acosh") == 0) { return acosh(value); }
    if (strcmp(functionType, "atanh") == 0) { return atanh(value); }
    return sin(value); // Default to sin
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double trigonometric(double value, const char* functionType);`);

    // Recupera o nó conectado como entrada
    const inputVar = this.getNode(node.getNodeByInput(0));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = trigonometric(${inputVar}, "${functionType}");`);

    return varname;
};

export { TrigonometricModel };
