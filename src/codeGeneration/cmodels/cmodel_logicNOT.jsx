const NotModel = function (node) {

    const varname = `var_${node.CGenUID}_not`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <stddef.h>');
    
    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
double not_operation(double* input) {
    return (*input == 0) ? 1.0 : 0.0;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double not_operation(double* input);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0)) || 0;

    // Cria o código da variável e da operação
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = not_operation(&${input});`);

    node.isvisited = true;

    return varname;
}

export { NotModel };
