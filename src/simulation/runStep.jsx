// Solves every terminal block (output) for the current step. Errors are
// left to the caller (SimulationEngine.runStep) since reacting to them
// involves engine state (emergencyStop) and UI (toast).
function solveTerminalNodes(nodes, saveLog, currentStep, currentTime) {
    saveLog && console.log("Time[" + currentStep + "] " + currentTime)
    nodes.filter(node => node.isTerminalBlock).forEach(node => node.solution())
}

export { solveTerminalNodes }
