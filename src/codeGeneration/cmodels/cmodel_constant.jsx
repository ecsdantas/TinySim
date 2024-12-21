const ConstantModel = function(node) {
    this.addPort(node.CGenUID, 1, node.value);
    return `model->data.${node.CGenUID}`;
};

export { ConstantModel }