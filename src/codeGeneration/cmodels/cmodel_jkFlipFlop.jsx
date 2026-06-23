// cmodel_jkFlipFlop.jsx
const JKFlipFlopModel = function (node) {
    const qVar = `var_${node.CGenUID}_outQ`;
    const notQVar = `var_${node.CGenUID}_outNotQ`;
    const calledPort = node.calledPort.options.label;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return calledPort === 'outQ' ? qVar : notQVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `jk_flipflop`
    this.addLibsC__functions(`
void jk_flipflop(double j, double k, double clk, double* q) {
    if (clk != 0) {
        if (j != 0 && k != 0) {
            *q = (*q != 0) ? 0.0 : 1.0;
        } else if (j != 0) {
            *q = 1.0;
        } else if (k != 0) {
            *q = 0.0;
        }
    }
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void jk_flipflop(double j, double k, double clk, double* q);`);

    // Recupera os nós conectados como entradas (0 = j, 1 = k, 2 = clk)
    const jVar = this.getNode(node.getNodeByInput(0));
    const kVar = this.getNode(node.getNodeByInput(1));
    const clkVar = this.getNode(node.getNodeByInput(2));

    // Cria as variáveis de estado e saída
    this.addModelC__vars(`static double ${qVar} = 0.0;`);
    this.addModelC__vars(`double ${notQVar};`);

    // Adiciona a chamada ao modelo JK Flip-Flop no passo de execução
    this.addModelC__step(`jk_flipflop(${jVar}, ${kVar}, ${clkVar}, &${qVar});`);
    this.addModelC__step(`${notQVar} = (${qVar} != 0) ? 0.0 : 1.0;`);

    return calledPort === 'outQ' ? qVar : notQVar;
};

export { JKFlipFlopModel };
