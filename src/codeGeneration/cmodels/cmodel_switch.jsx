// cmodel_switch.jsx
const SwitchModel = function (node) {
    const varname = `var_${node.CGenUID}_switch`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para o tipo `bool`
    this.addLibsH__include('#include <stdbool.h>');

    // Adiciona a implementação da função `switch_block`
    this.addLibsC__functions(`
void switch_block(double in1, bool condition, double in3, double* output) {
    if (condition) {
        *output = in1;
    } else {
        *output = in3;
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void switch_block(double in1, bool condition, double in3, double* output);`);

    // Recupera os nós conectados como entradas
    const inputVar1 = this.getNode(node.getNodeByInput(0));
    const conditionVar = this.getNode(node.getNodeByInput(1));
    const inputVar3 = this.getNode(node.getNodeByInput(2));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`switch_block(${inputVar1}, ${conditionVar}, ${inputVar3}, &${varname});`);

    return varname;
};

export { SwitchModel };
