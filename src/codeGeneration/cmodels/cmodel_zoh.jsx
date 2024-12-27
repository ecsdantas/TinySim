// cmodel_zoh.jsx
const ZOHModel = function (node) {
    const stateVar = `var_${node.CGenUID}_state`;
    const outputVar = `var_${node.CGenUID}_output`;
    const sampleTime = node.sampleTime || 1.0; // Tempo de amostragem

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona a biblioteca necessária para funções matemáticas
    this.addLibsH__include('#include <math.h>');

    // Adiciona a implementação da função `zoh`
    this.addLibsC__functions(`
void zoh(double input, double* state, double* output, double sampleTime, double* currentTime) {
    static double lastUpdateTime = 0.0;
    if (fmod(*currentTime, sampleTime) < 1e-6) {
        *state = input;
        lastUpdateTime = *currentTime;
    }
    *output = *state;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void zoh(double input, double* state, double* output, double sampleTime, double* currentTime);`);

    // Recupera o nó conectado como entrada
    const input = this.getNode(node.getNodeByInput(0));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${stateVar} = 0.0;`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo ZOH no passo de execução
    this.addModelC__step(`zoh(${input}, &${stateVar}, &${outputVar}, ${sampleTime}, &model->simulation.simulated_time);`);

    return outputVar;
};

export { ZOHModel };
