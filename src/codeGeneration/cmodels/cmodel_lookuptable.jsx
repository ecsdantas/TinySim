// cmodel_lookup_table.jsx
const LookupTableModel = function (node) {
    const inputVar = this.getNode(node.getNodeByInput(0));
    const outputVar = `var_${node.CGenUID}_output`;
    const tableVar = `var_${node.CGenUID}_table`;
    const interpolationMethod = node.interpolationMethod || 'nearest';
    const lookupTable = node.lookupTable || [[0, 0]];

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <math.h>');
    this.addLibsH__include('#include <string.h>');

    // Adiciona a implementação da função `lookup_table`
    this.addLibsC__functions(`
double lookup_table(const double* table, int size, double input, const char* method) {
    if (size < 2) return NAN;

    if (strcmp(method, "nearest") == 0) {
        double minDiff = fabs(input - table[0]);
        double result = table[1];
        for (int i = 2; i < size * 2; i += 2) {
            double diff = fabs(input - table[i]);
            if (diff < minDiff) {
                minDiff = diff;
                result = table[i + 1];
            }
        }
        return result;
    } else if (strcmp(method, "linear") == 0) {
        for (int i = 0; i < size - 1; i++) {
            double x1 = table[i * 2];
            double y1 = table[i * 2 + 1];
            double x2 = table[(i + 1) * 2];
            double y2 = table[(i + 1) * 2 + 1];
            if (x1 <= input && input <= x2) {
                return y1 + (y2 - y1) * (input - x1) / (x2 - x1);
            }
        }
        return NAN; // Out of bounds
    } else if (strcmp(method, "stepwise") == 0) {
        for (int i = 0; i < size - 1; i++) {
            double x1 = table[i * 2];
            double y1 = table[i * 2 + 1];
            if (input < table[(i + 1) * 2]) {
                return y1;
            }
        }
        return table[(size - 1) * 2 + 1];
    }
    return NAN;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double lookup_table(const double* table, int size, double input, const char* method);`);

    // Cria as variáveis de tabela e saída
    this.addModelC__vars(`static double ${tableVar}[] = {${lookupTable.flat()}};`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo LookupTable no passo de execução
    this.addModelC__step(`${outputVar} = lookup_table(${tableVar}, ${lookupTable.length}, ${inputVar}, "${interpolationMethod}");`);

    return outputVar;
};

export { LookupTableModel };
