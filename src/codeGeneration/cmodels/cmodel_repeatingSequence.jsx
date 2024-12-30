const RepeatingSequenceModel = function (node) {

    const varname = `var_${node.CGenUID}_repeatingSequence`;
    const sequenceName = `var_${node.CGenUID}_sequence`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return varname;
    }

    // Adiciona a biblioteca necessária
    this.addLibsH__include('#include <math.h>');

    // Adiciona a biblioteca necessária
    this.addLibsC__functions(`
void get_repeating_sequence_value(const double* sequence, size_t sequence_length, double* current_time, double* output) {
    size_t index = (size_t) fmod(*current_time, (double)sequence_length);
    *output = sequence[index];
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void get_repeating_sequence_value(const double* sequence, size_t sequence_length, double* current_time, double* output);`);

    // Recupera o nó conectado como entrada
    this.addModelC__vars(`const double ${sequenceName}[] = { ${node.sequence.join(', ')} };`);

    // Cria o código da variável de saída
    this.addModelC__vars(`double ${varname};`);
    this.addModelC__step(`size_t var_${node.CGenUID}_length = sizeof(var_${node.CGenUID}_sequence)/sizeof(var_${node.CGenUID}_sequence[0]);`);
    this.addModelC__step(`get_repeating_sequence_value(${sequenceName}, var_${node.CGenUID}_length, &model->simulation.simulated_time, &${varname});`);

    node.isvisited = true;

    return varname;
}

export { RepeatingSequenceModel };
