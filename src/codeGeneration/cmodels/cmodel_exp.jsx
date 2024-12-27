// cmodel_exponential.jsx
const ExponentialModel = function (node) {
    const varname = `var_${node.CGenUID}_exp`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para funções matemáticas
    this.addLibsH__include('#include <math.h>');

    // Recupera o nó conectado como entrada
    const inputVar = this.getNode(node.getNodeByInput(0));

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = exp(${inputVar});`);

    return varname;
};

export { ExponentialModel };
