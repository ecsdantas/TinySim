// cmodel_demux.jsx
// Não declara variável própria: devolve uma expressão de indexação no
// array C da entrada (ex. "var_mux_0[1]"), usando node.calledPort para
// saber qual saída (out1, out2...) foi pedida — mesmo padrão de
// cmodel_dFlipFlop.jsx para blocos com múltiplas portas de saída.
const DemuxModel = function (node) {
    const calledPort = node.calledPort.options.label;
    const index = Number(calledPort.replace('out', '')) - 1;

    const arrayVar = this.getNode(node.getNodeByInput(0));

    return `${arrayVar}[${index}]`;
};

export { DemuxModel };
