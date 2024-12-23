const PowModel = function (node) {
    const baseVar = this.getNode(node.getNodeByInput(0));
    const exponentVar = this.getNode(node.getNodeByInput(1));
    const outputVar = `${node.CGenUID}_output`;

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    // Adiciona a biblioteca math.h para a função pow
    this.addIncludeLib('<math.h>');

    this.addLib({
        name: "power",
        declaration: `double power(double base, double exponent);`,
        implementation: `
            double power(double base, double exponent) {
                return pow(base, exponent);
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Pow no passo
    this.addStep(`double ${outputVar} = power(${baseVar}, ${exponentVar})`);

    return outputVar;
};

export { PowModel };
