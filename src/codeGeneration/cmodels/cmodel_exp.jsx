const ExponentialModel = function (node) {

    const inputVar = this.getNode(node.getNodeByInput(0));
    
    if (node.isvisited) {
        return `exp(${inputVar})`;
    }
    node.isvisited = true;

    // Adiciona a biblioteca math.h por conta do exp
    this.addIncludeLib('<math.h>')

    return `exp(${inputVar})`;
};

export { ExponentialModel };
