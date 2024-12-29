// cmodel_sqrt.jsx
const SqrtModel = function (node) {
    const varname = `var_${node.CGenUID}_sqrt`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para funções matemáticas
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `sqrt`
    this.addLibsC__functions(`
void square_root(double value, double* output) {
    if (value < 0) {
        *output = NAN; // Square root is undefined for negative values
    } else {
        *output = sqrt(value);
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void square_root(double value, double* output);`);

    // Recupera o nó conectado como entrada
    const inputVar = this.getNode(node.getNodeByInput(0));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`square_root(${inputVar}, &${varname});`);

    return varname;
};

export { SqrtModel };
