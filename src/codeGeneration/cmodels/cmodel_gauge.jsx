const GaugeModel = function (node) {
    this.addPort(node.CGenUID, 0, 0);
    this.addModelC__step(`model->data.${node.CGenUID} = ${this.getNode(node.getNodeByInput(0))};`);
};

export { GaugeModel };