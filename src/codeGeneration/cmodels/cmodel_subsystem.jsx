// cmodel_subsystem.jsx
// Reaproveita exatamente as mesmas pontes que o lado da simulação já usa
// (getNodeByInput, parentSubsystem, portIndex, getOutputMarkers()) — ver
// src/elements/subsystem.jsx. Nenhum dos três delega gera variável própria;
// cada um só repassa a expressão C do nó que efetivamente resolveu, então
// subsistemas aninhados funcionam por recursão sem caso especial, e a
// dedupe via node.isvisited no nó interno real evita código duplicado
// mesmo que a mesma saída seja consultada mais de uma vez.

const SubsystemModel = function (node) {
    const calledPort = node.calledPort.options.label; // 'out1', 'out2', ...
    const index = Number(calledPort.replace('out', '')) - 1;
    const outputMarker = node.getOutputMarkers()[index];
    if (!outputMarker) {
        throw new Error(`"${node.getModelName()}": saída ${index + 1} não existe (rode "Sync Ports")`);
    }
    return this.getNode(outputMarker);
};

const SubsystemOutputModel = function (node) {
    const inpt = node.getNodeByInput(0);
    if (!inpt) {
        throw new Error(`"${node.getModelName()}": saída desconectada internamente`);
    }
    return this.getNode(inpt);
};

const SubsystemInputModel = function (node) {
    const outerNode = node.parentSubsystem.getNodeByInput(node.portIndex);
    if (!outerNode) {
        throw new Error(`"${node.getModelName()}": entrada ${node.portIndex + 1} não conectada externamente`);
    }
    return this.getNode(outerNode);
};

export { SubsystemModel, SubsystemOutputModel, SubsystemInputModel };
