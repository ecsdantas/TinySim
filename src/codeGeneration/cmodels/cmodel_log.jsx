// cmodel_log.jsx
const LogModel = function (node) {
    const varname = `var_${node.CGenUID}_log`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para funções matemáticas
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `logarithm`
    this.addLibsC__functions(`
void logarithm(double value, double base, double* output) {
    if (value <= 0 || base <= 0 || base == 1) {
        *output = NAN; // Logarithm is undefined for these cases
    } else {
        *output = log(value) / log(base);
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void logarithm(double value, double base, double* output);`);

    // Recupera os nós conectados como entradas
    const inputVar1 = this.getNode(node.getNodeByInput(0));
    const inputVar2 = this.getNode(node.getNodeByInput(1));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`logarithm(${inputVar1}, ${inputVar2}, &${varname});`);

    return varname;
};

export { LogModel };
