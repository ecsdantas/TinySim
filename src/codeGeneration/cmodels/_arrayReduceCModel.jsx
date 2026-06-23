// Factory for cmodels that compile down to a single C function operating
// over a (const double* array, int size) pair — the shape shared by Add,
// Sub, Multiply, Divide and Mod. `this` is bound to the ModelActions
// instance by registerModels(), same as a hand-written cmodel function.
function makeArrayReduceCModel({ suffix, cFunctionName, cFunctionBody, includes = [] }) {
    return function (node) {
        const varname = `var_${node.CGenUID}_${suffix}`;

        // Verifica se a variável já foi utilizada
        if (node.isvisited) {
            return varname;
        }
        node.isvisited = true;

        includes.forEach(include => this.addLibsH__include(include));

        this.addLibsC__functions(`
double ${cFunctionName}(const double* array, int size) {
${cFunctionBody}
}
        `);
        this.addLibsH__declaration(`double ${cFunctionName}(const double* array, int size);`);

        // Recupera os nós conectados como entradas
        const inputs = node.getInPorts().map((_, i) => this.getNode(node.getNodeByInput(i)));

        // Cria uma nova variável para os parâmetros do método
        const paramVar = this.addModelC__generateNewVar(`${suffix}_param`);
        this.addModelC__step(`double ${paramVar}[] = {${inputs.join(',')}};`);

        // Cria a variável de saída e adiciona o passo de execução
        this.addModelC__vars(`double ${varname};`);
        this.addModelC__step(`${varname} = ${cFunctionName}(${paramVar}, ${inputs.length});`);

        return varname;
    };
}

export { makeArrayReduceCModel };
