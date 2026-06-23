// cmodel_tFlipFlop.jsx
const TFlipFlopModel = function (node) {
    const qVar = `var_${node.CGenUID}_outQ`;
    const notQVar = `var_${node.CGenUID}_outNotQ`;
    const calledPort = node.calledPort.options.label;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return calledPort === 'outQ' ? qVar : notQVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `t_flipflop`
    this.addLibsC__functions(`
void t_flipflop(double t, double clk, double* q) {
    if (clk != 0 && t != 0) {
        *q = (*q != 0) ? 0.0 : 1.0;
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void t_flipflop(double t, double clk, double* q);`);

    // Recupera os nós conectados como entradas (0 = t, 1 = clk)
    const tVar = this.getNode(node.getNodeByInput(0));
    const clkVar = this.getNode(node.getNodeByInput(1));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${qVar} = 0.0;`);
    this.addModelC__vars(`double ${notQVar};`);

    // Adiciona a chamada ao modelo T Flip-Flop no passo de execução
    this.addModelC__step(`t_flipflop(${tVar}, ${clkVar}, &${qVar});`);
    this.addModelC__step(`${notQVar} = (${qVar} != 0) ? 0.0 : 1.0;`);

    return calledPort === 'outQ' ? qVar : notQVar;
};

export { TFlipFlopModel };
