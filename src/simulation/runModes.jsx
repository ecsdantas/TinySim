// Standard and real-time execution loops. Both only touch the engine's
// public surface (runStep, stopTime, currentTime, stepSize,
// isSimulationRunning, emergencyStop), so they take the engine instance
// itself rather than duplicating its state.
function runStandardLoop(engine) {
    while ((engine.stopTime >= engine.currentTime) && (!engine.emergencyStop) && engine.isSimulationRunning) {
        engine.runStep()
    }
    engine.isSimulationRunning = false
}

function runRealTimeLoop(engine) {
    // Update rate of realtime
    engine.stepSize = 0.2;

    const sync = () => {
        setTimeout(() => {
            (!engine.emergencyStop) && engine.isSimulationRunning && sync(); // Chama uma nova instância
        }, engine.stepSize * 1E3)
        engine.runStep()
    }

    sync()
}

export { runStandardLoop, runRealTimeLoop }
