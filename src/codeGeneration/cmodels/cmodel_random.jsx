// cmodel_random_number.jsx
const RandomNumberModel = function (node) {
    const varname = `var_${node.CGenUID}_random`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    node.isvisited = true;

    // Adiciona as bibliotecas necessárias
    this.addLibsH__include('#include <stdlib.h>');
    this.addLibsH__include('#include <string.h>');
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `generate_random`
    this.addLibsC__functions(`
double generate_random(double min, double max, const char* distribution) {
    if (strcmp(distribution, "uniform") == 0) {
        return ((double)rand() / RAND_MAX) * (max - min) + min;
    } else if (strcmp(distribution, "normal") == 0) {
        double u = 0, v = 0;
        while (u == 0) u = (double)rand() / RAND_MAX; // Converting [0,1) to (0,1)
        while (v == 0) v = (double)rand() / RAND_MAX;
        double num = sqrt(-2.0 * log(u)) * cos(2.0 * M_PI * v);
        double mean = (max + min) / 2.0;
        double std_dev = (max - min) / 6.0; // 99.7% of values within +/- 3 std dev
        double result = num * std_dev + mean;
        if (result < min) return min;
        if (result > max) return max;
        return result;
    }
    return NAN;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`double generate_random(double min, double max, const char* distribution);`);

    // Define os parâmetros
    const minValue = node.minValue || 0;
    const maxValue = node.maxValue || 1;
    const distribution = `"${node.distribution}"`;

    // Cria a variável de saída e adiciona o passo de execução
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`${varname} = generate_random(${minValue}, ${maxValue}, ${distribution});`);

    return varname;
};

export { RandomNumberModel };
