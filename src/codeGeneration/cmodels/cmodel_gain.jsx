const GainModel = function (node) {
    const varname = `var_${node.CGenUID}_gain`;

    // Verifica se a variável já foi utilizada
    if (this.inUseVariables.includes(varname)) {
        return varname;
    }

    // Cria variáveis necessárias
    const input = this.getNode(node.getNodeByInput(0));
    const gain = node.gainValue;

    // Adiciona os passos de execução
    this.addStep(`double ${varname} = ${input} * ${gain}`);

    // Registra a nova variável
    this.inUseVariables.push(varname);

    return varname;
};

export { GainModel };