const DisplayModel = function (node) {
    this.addPort(node.CGenUID, 0, 0); // Agora usa o `this` correto
    this.addStep(`model->data.${node.CGenUID} = ${this.getNode(node.getNodeByInput(0))}`);
};

export { DisplayModel };