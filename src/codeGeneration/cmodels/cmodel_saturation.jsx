// cmodel_saturation.jsx
const SaturationModel = function (node) {
    const varname = `var_${node.CGenUID}_saturation`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `saturate_value`
    this.addLibsC__functions(`
double saturate_value(double value, double min_val, double max_val) {
    if (value < min_val) return min_val;
    if (value > max_val) return max_val;
    return value;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double saturate_value(double value, double min_val, double max_val);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Define os parâmetros
    const minValue = node.MinValue || 0;
    const maxValue = node.MaxValue || 10;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = saturate_value(${input}, ${minValue}, ${maxValue});`);

    return varname;
};

export { SaturationModel };
