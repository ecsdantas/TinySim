// cmodel_gain.jsx
const GainModel = function (node) {
    const varname = `var_${node.CGenUID}_gain`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Adiciona uma variável única para o ganho
    const gain_var = this.addModelC__generateNewVar('gain_value');
    this.addModelC__vars(`double ${gain_var} = ${node.gainValue};`);

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = ${input} * ${gain_var};`);

    node.isvisited = true;

    return varname;
};

export { GainModel };
