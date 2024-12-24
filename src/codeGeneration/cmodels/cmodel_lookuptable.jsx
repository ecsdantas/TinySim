const LookupTableModel = function (node) {
    const inputVar = this.getNode(node.getNodeByInput(0));
    const outputVar = `${node.CGenUID}_output`;
    const tableVar = `${node.CGenUID}_table`;
    const interpolationMethod = node.interpolationMethod || 'nearest';
    const lookupTable = node.lookupTable || [[0, 0]];

    if (node.isvisited || this.sharedModelVars.some(sMV => sMV.name === outputVar)) {
        return outputVar;
    }
    node.isvisited = true;

    // Add required libraries
    this.addIncludeLib('<math.h>');
    this.addIncludeLib('<string.h>');

    // Add interpolation functions
    this.addLib({
        name: "lookup_table",
        declaration: `double lookup_table(const double* table, int size, double input, const char* method);`,
        implementation: `
            double lookup_table(const double* table, int size, double input, const char* method) {
                if (size < 2) return NAN;

                if (strcmp(method, "nearest") == 0) {
                    double minDiff = fabs(input - table[0]);
                    double result = table[1];
                    for (int i = 2; i < size * 2; i += 2) {
                        double diff = fabs(input - table[i]);
                        if (diff < minDiff) {
                            minDiff = diff;
                            result = table[i + 1];
                        }
                    }
                    return result;
                } else if (strcmp(method, "linear") == 0) {
                    for (int i = 0; i < size - 1; i++) {
                        double x1 = table[i * 2];
                        double y1 = table[i * 2 + 1];
                        double x2 = table[(i + 1) * 2];
                        double y2 = table[(i + 1) * 2 + 1];
                        if (x1 <= input && input <= x2) {
                            return y1 + (y2 - y1) * (input - x1) / (x2 - x1);
                        }
                    }
                    return NAN; // Out of bounds
                } else if (strcmp(method, "stepwise") == 0) {
                    for (int i = 0; i < size - 1; i++) {
                        double x1 = table[i * 2];
                        double y1 = table[i * 2 + 1];
                        if (input < table[(i + 1) * 2]) {
                            return y1;
                        }
                    }
                    return table[(size - 1) * 2 + 1];
                }
                return NAN;
            }
        `
    });

    // Add shared variables
    this.addSharedModelVar({
        ref: node.CGenUID,
        name: outputVar,
        value: 0.0,
        type: 'static double'
    });

    this.addSharedModelVar({
        ref: node.CGenUID,
        name: `${tableVar}[]`,
        inlineValue: `{${lookupTable.flat()}}`,
        type: `static double`
    });

    // Add simulation step
    this.addStep(`double ${outputVar} = lookup_table(${tableVar}, ${lookupTable.length}, ${inputVar}, "${interpolationMethod}")`);

    return outputVar;
};

export { LookupTableModel };
