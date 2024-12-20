const inUseVariables = [];

const createNewVar = (v) => {
    const existingVARs = new Set(inUseVariables);
    let i = 0;
    while (existingVARs.has(v + i)) {
        i++;
    }
    v = v + i
    inUseVariables.push(v)
    return v
}

const ModelActions = {
    ConstantModel: (node) => {
        ModelActions.addPort(node.CGenUID, 1, node.value);
        return `model->data.${node.CGenUID}`;
    },
    AddModel: (node) => {
        const inPorts = node.getInPorts()
        ModelActions.addLib({
            name: "add",
            declaration: `double add(const double* array, int size);`,
            implementation: `double add(const double* array, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) { sum += array[i]; }
    return sum;
}`
        });
        // Cria uma variável
        const inputs = inPorts.map((_,i) => ModelActions.getNode(node.getNodeByInput(i)))
        const add_param_var = createNewVar('add_param');
        ModelActions.addStep(`double ${add_param_var}[] = {${inputs.join(',')}}`);
        const sum_result = createNewVar('sum_result');
        ModelActions.addStep(`double ${sum_result} = add(${add_param_var}, ${inputs.length})`);
        return sum_result;
    },

    DisplayModel: (node) => {
        ModelActions.addPort(node.CGenUID, 0, 0);
        ModelActions.addStep(`model->data.${node.CGenUID} = ${ModelActions.getNode(node.getNodeByInput(0))}`)
    },
    
    default: () => "Error",
};

export { ModelActions };
