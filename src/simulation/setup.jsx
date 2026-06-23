// Pulls the node list out of a diagram model. Kept separate from
// SimulationEngine so the "can this model be simulated?" check is
// testable without touching the engine's private state.
function setupSimulation(model) {
    if (!model || !model.getNodes) {
        return { ok: false, nodes: null }
    }
    return { ok: true, nodes: model.getNodes() }
}

export { setupSimulation }
