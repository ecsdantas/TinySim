const ModModel = function (node) {

    const varname = `var_${node.CGenUID}_mod`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <math.h>');

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double mod_operation(double a, double b) {
    if (b == 0) return NAN; // Evita divisão por zero
    return fmod(a, b);
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double mod_operation(double a, double b);`);

    // Recupera os nós conectados como entradas
    const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

    // Verifica se há entradas suficientes
    if (inputs.length < 2) {
        throw new Error("O modelo Mod precisa de pelo menos duas entradas.");
    }

    // Cria as variáveis para os valores e o resultado
    const mod_result_var = this.addModelC__generateNewVar('mod_result');
    let mod_step_code = `double ${mod_result_var} = ${inputs[0]};\n`;

    for (let i = 1; i < inputs.length; i++) {
        mod_step_code += `${mod_result_var} = mod_operation(${mod_result_var}, ${inputs[i]});\n`;
    }

    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${mod_step_code}${varname} = ${mod_result_var};`);

    node.isvisited = true;

    return varname;
}

export { ModModel };
