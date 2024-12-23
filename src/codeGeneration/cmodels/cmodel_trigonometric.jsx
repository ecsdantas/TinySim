const TrigonometricModel = function (node) {
    const inputVar = this.getNode(node.getNodeByInput(0));
    const outputVar = `${node.CGenUID}_output`;
    const functionType = node.functionType || 'sin';

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    // Adiciona a biblioteca math.h por conta do exp
    this.addIncludeLib('<math.h>')
    this.addIncludeLib('<string.h>')
  
    this.addLib({
        name: "trigonometric",
        declaration: `double trigonometric(double value, const char* functionType);`,
        implementation: `
            double trigonometric(double value, const char* functionType) {
                if (strcmp(functionType, "sin") == 0) return sin(value);
                if (strcmp(functionType, "cos") == 0) return cos(value);
                if (strcmp(functionType, "tan") == 0) return tan(value);
                if (strcmp(functionType, "asin") == 0) return asin(value);
                if (strcmp(functionType, "acos") == 0) return acos(value);
                if (strcmp(functionType, "atan") == 0) return atan(value);
                if (strcmp(functionType, "sinh") == 0) return sinh(value);
                if (strcmp(functionType, "cosh") == 0) return cosh(value);
                if (strcmp(functionType, "tanh") == 0) return tanh(value);
                if (strcmp(functionType, "asinh") == 0) return asinh(value);
                if (strcmp(functionType, "acosh") == 0) return acosh(value);
                if (strcmp(functionType, "atanh") == 0) return atanh(value);
                return sin(value); // Default to sin
            }
        `
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    // Adiciona a chamada ao modelo Trigonometric no passo
    this.addStep(`double ${outputVar} = trigonometric(${inputVar}, "${functionType}")`);

    return outputVar;
};

export { TrigonometricModel };
