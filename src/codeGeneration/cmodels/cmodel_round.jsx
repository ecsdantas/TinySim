// cmodel_round.jsx
const RoundModel = function (node) {
    const varname = `var_${node.CGenUID}_round`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <math.h>');
    this.addLibsH__include('#include <string.h>');

    // Adiciona a implementação da função `round_value`
    this.addLibsC__functions(`
double round_value(double value, int decimal_places, const char* round_type) {
    double factor = pow(10, decimal_places);
    if (strcmp(round_type, "ceil") == 0) {
        return ceil(value * factor) / factor;
    } else if (strcmp(round_type, "floor") == 0) {
        return floor(value * factor) / factor;
    } else {
        return round(value * factor) / factor;
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double round_value(double value, int decimal_places, const char* round_type);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Define os parâmetros
    const decimalPlaces = node.decimalPlaces || 0;
    const roundType = `"${node.roundType}"`;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = round_value(${input}, ${decimalPlaces}, ${roundType});`);

    return varname;
};

export { RoundModel };
