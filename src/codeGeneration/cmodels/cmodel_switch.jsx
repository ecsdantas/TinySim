const SwitchModel = function (node) {
    const inputVar1 = this.getNode(node.getNodeByInput(0));
    const conditionVar = this.getNode(node.getNodeByInput(1));
    const inputVar3 = this.getNode(node.getNodeByInput(2));
    const outputVar = `${node.CGenUID}_output`;

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    this.addIncludeLib('<stdbool.h>');

    this.addLib({
        name: "switch",
        declaration: `void switch_block(double in1, bool condition, double in3, double* output);`,
        implementation: `
            void switch_block(double in1, bool condition, double in3, double* output) {
                if (condition) {
                    *output = in1;
                } else {
                    *output = in3;
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

    // Adiciona a chamada ao modelo Switch no passo
    this.addStep(`switch_block(${inputVar1}, ${conditionVar}, ${inputVar3}, &${outputVar})`);

    return outputVar;
};

export { SwitchModel };
