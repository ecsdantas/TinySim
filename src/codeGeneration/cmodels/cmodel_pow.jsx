// cmodel_pow.jsx
const PowModel = function (node) {
    const varname = `var_${node.CGenUID}_pow`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para a função `pow`
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `power`
    this.addLibsC__functions(`
double power(double base, double exponent) {
    return pow(base, exponent);
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double power(double base, double exponent);`);

    // Recupera os nós conectados como entradas
    const baseVar = this.getNode(node.getNodeByInput(0));
    const exponentVar = this.getNode(node.getNodeByInput(1));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = power(${baseVar}, ${exponentVar});`);

    return varname;
};

export { PowModel };
