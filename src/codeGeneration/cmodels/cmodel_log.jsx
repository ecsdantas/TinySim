const LogModel = function (node) {

    const outputVar = `${node.CGenUID}_output`;
    const inputVar1 = this.getNode(node.getNodeByInput(0));
    const inputVar2 = this.getNode(node.getNodeByInput(1));

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    // Adiciona a biblioteca math.h por conta do exp
    this.addIncludeLib('<math.h>')

    this.addLib({
        name: "logarithm",
        declaration: `void logarithm(double value, double base, double* output);`,
        implementation: `
            void logarithm(double value, double base, double* output) {
                if (value <= 0 || base <= 0 || base == 1) {
                    *output = NAN; // Logarithm is undefined for these cases
                } else {
                    *output = log(value) / log(base);
                }
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Log no passo
    this.addStep(`logarithm(${inputVar1}, ${inputVar2}, &${outputVar})`);

    return outputVar;
};

export { LogModel };
