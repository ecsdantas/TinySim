const IsEvenModel = function (node) {

    const varname = `var_${node.CGenUID}_isEven`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <math.h>');

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double is_even(double number) {
    return fmod(number, 2.0) == 0.0 ? 1.0 : 0.0;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double is_even(double number);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0)) || 0;

    // Cria o código da variável e da operação
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = is_even(${input});`);

    node.isvisited = true;

    return varname;
}

export { IsEvenModel };
