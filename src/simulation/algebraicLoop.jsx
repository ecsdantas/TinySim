// Detects feedback loops made only of combinational (memoryless) blocks.
//
// Blocks like Integrator/Memory/ZOH/Derivator/FirstOrder/PIDController hold
// internal state and guard their `solution()` against re-entrancy by caching
// a value *before* recursing into their inputs (see e.g. integrator.jsx).
// That guard means their output for the current step never actually depends
// on their own current-step input, so they are safe to use inside a
// feedback path. They mark themselves with `breaksAlgebraicLoop = true`.
//
// A cycle that never passes through one of those blocks is a true algebraic
// loop: solving it requires the value to already be known, which is what
// crashes the simulator (infinite recursion) today instead of failing with
// a clear error.
function getInputNodes(node) {
    if (!node.getInPorts) return []
    const inPorts = node.getInPorts()
    const inputs = []
    for (let i = 0; i < inPorts.length; i++) {
        const inputNode = node.getNodeByInput ? node.getNodeByInput(i) : null
        if (inputNode) inputs.push(inputNode)
    }
    return inputs
}

function nodeLabel(node) {
    return (node.getModelName ? node.getModelName() : node.constructor?.name) || 'Block'
}

function detectAlgebraicLoop(nodes) {
    const state = new Map() // node -> 'visiting' | 'done'
    const path = []

    function visit(node) {
        if (node.breaksAlgebraicLoop) return null
        const status = state.get(node)
        if (status === 'done') return null
        if (status === 'visiting') {
            const start = path.indexOf(node)
            return path.slice(start).concat(node)
        }
        state.set(node, 'visiting')
        path.push(node)
        for (const input of getInputNodes(node)) {
            const cycle = visit(input)
            if (cycle) return cycle
        }
        path.pop()
        state.set(node, 'done')
        return null
    }

    for (const node of nodes) {
        if (state.get(node) === 'done') continue
        const cycle = visit(node)
        if (cycle) {
            return { hasCycle: true, cycle, cycleLabels: cycle.map(nodeLabel) }
        }
    }
    return { hasCycle: false, cycle: [], cycleLabels: [] }
}

export { detectAlgebraicLoop }
