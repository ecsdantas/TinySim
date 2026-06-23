// cmodel_srFlipFlop.jsx
const SRFlipFlopModel = function (node) {
    const qVar = `var_${node.CGenUID}_outQ`;
    const notQVar = `var_${node.CGenUID}_outNotQ`;
    const calledPort = node.calledPort.options.label;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return calledPort === 'outQ' ? qVar : notQVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `sr_flipflop`
    this.addLibsC__functions(`
void sr_flipflop(double set, double reset, double* q) {
    if (set != 0 && reset != 0) {
        // Invalid state: kept unchanged
    } else if (set != 0) {
        *q = 1.0;
    } else if (reset != 0) {
        *q = 0.0;
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void sr_flipflop(double set, double reset, double* q);`);

    // Recupera os nós conectados como entradas (0 = set, 1 = reset)
    const setVar = this.getNode(node.getNodeByInput(0));
    const resetVar = this.getNode(node.getNodeByInput(1));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${qVar} = 0.0;`);
    this.addModelC__vars(`double ${notQVar};`);

    // Adiciona a chamada ao modelo SR Flip-Flop no passo de execução
    this.addModelC__step(`sr_flipflop(${setVar}, ${resetVar}, &${qVar});`);
    this.addModelC__step(`${notQVar} = (${qVar} != 0) ? 0.0 : 1.0;`);

    return calledPort === 'outQ' ? qVar : notQVar;
};

export { SRFlipFlopModel };
