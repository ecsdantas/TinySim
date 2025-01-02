const HistogramModel = function (node) {
    this.addPort(node.CGenUID, 0, 0);
    node.getNodes().map( n => 
        this.addModelC__step(`model->data.${node.CGenUID} = ${this.getNode(n)};`)
    )
};

export { HistogramModel };