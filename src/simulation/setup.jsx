import { detectAlgebraicLoop } from "./algebraicLoop"

// Pulls the node list out of a diagram model. Kept separate from
// SimulationEngine so the "can this model be simulated?" check is
// testable without touching the engine's private state.
function setupSimulation(model) {
    if (!model || !model.getNodes) {
        return { ok: false, nodes: null }
    }
    const nodes = model.getNodes()

    const loop = detectAlgebraicLoop(nodes)
    if (loop.hasCycle) {
        return { ok: false, nodes: null, error: 'algebraic-loop', cycleLabels: loop.cycleLabels }
    }

    return { ok: true, nodes }
}

export { setupSimulation }
