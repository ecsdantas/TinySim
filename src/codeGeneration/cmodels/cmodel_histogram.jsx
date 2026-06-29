// cmodel_histogram.jsx
// Como Gauge/Display, não há desenho de gráfico em C: cada entrada
// conectada é exposta como uma porta GET (impressa a cada passo pelo
// main.c gerado). Mesmo padrão de cmodel_gauge.jsx/cmodel_display.jsx,
// estendido para múltiplas portas (Histogram aceita N datasets via "Add
// port", igual ao Plot).
const HistogramModel = function (node) {
    node.getInPorts().forEach((_, index) => {
        const portName = `${node.CGenUID}_${index + 1}`;
        this.addPort(portName, 0, 0);
        this.addModelC__step(`model->data.${portName} = ${this.getNode(node.getNodeByInput(index))};`);
    });
};

export { HistogramModel };
