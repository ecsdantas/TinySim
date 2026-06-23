import { toast } from "react-toastify"
import { setupSimulation } from "./setup"
import { solveTerminalNodes } from "./runStep"
import { runStandardLoop, runRealTimeLoop } from "./runModes"
import { resetNodes } from "./reset"
import { buildTotalTimeArray, buildTimeArray } from "./timeArrays"
import { EULER } from "./integrationMethods"

class SimulationEngine {

    currentStep = 0
    currentTime = 0
    stepSize = 1
    stopTime = 10
    method = EULER // método de integração usado pelos blocos dinâmicos (ver integrationMethods.jsx)
    statelessMode = false
    saveLog = true
    #model = null
    #nodes = null
    realTimeMode = false
    emergencyStop = false
    isSimulationRunning = false

    constructor(model) {
        // Salva o modelo contendo todo o circuito
        this.#model = model;
        this.runStep = this.runStep.bind(this);
        this.runStandard = this.runStandard.bind(this);
        this.runRealTime = this.runRealTime.bind(this);
        this.resetSimulation = this.resetSimulation.bind(this);
    }

    // Define o modelo
    setModel(model) {
        this.#model = model
        this.runSetup()
    }

    runSetup() {

        try {

            // Impede a simulação de continuar
            if (this.isSimulationRunning) {
                this.emergencyStop = true
                this.isSimulationRunning = false
                return false
            }

            const result = setupSimulation(this.#model)
            if (!result.ok) return false

            this.#nodes = result.nodes
            return true

        } catch (error) {
            console.error("Unable to set-up simulation environment")
            toast.error(<div>An error occurred while set-up the simulation envinronment</div>)
            this.emergencyStop = true;
            return false
        }

    }

    // Run simulation
    run() {

        // Run setup first
        if (!this.runSetup()) {
            return
        }

        // Reseta a simulação
        this.resetSimulation()

        // Habilita a flag de simulação
        this.isSimulationRunning = true

        // Log de simulação
        this.saveLog && console.log("==== Simulation is starting ====")

        // Simula
        const sim = this.realTimeMode ? this.runRealTime : this.runStandard
        sim()

    }

    // Simula no modo padrão
    runStandard() {
        runStandardLoop(this)
    }

    // Simula com sincronismo em tempo real
    runRealTime() {
        runRealTimeLoop(this)
    }

    // Roda um passo de simulação
    runStep() {

        try {
            // Procura por outputs e resolve cada um
            solveTerminalNodes(this.#nodes, this.saveLog, this.currentStep, this.currentTime)

            // Incrementa o step
            this.currentStep += 1
            this.currentTime += this.stepSize
        } catch (error) {
            this.saveLog && console.error("An error occurred during simulation step:", error);
            toast.error(<div>An error occurred at step {this.currentStep}.<br />Did you place an output block?</div>)
            this.emergencyStop = true;
        }
    }

    resetSimulation() {

        // Reseta o Step e o  time
        this.currentStep = 0;
        this.currentTime = 0;
        this.emergencyStop = false
        this.isSimulationRunning = false

        // Reseta o console
        this.saveLog && console.clear()

        // Aplica o reset nos modelos que contém reset
        resetNodes(this.#nodes)

    }

    // Obtem o step atual
    getCurrentStep() {
        return this.currentStep
    }

    getCurrentTime() {
        return this.currentTime
    }

    getStepTime() {
        return this.stepSize
    }

    // Obtem o método de integração atual (ver integrationMethods.jsx)
    getMethod() {
        return this.method
    }

    setMethod(method) {
        this.method = method
    }

    // Obtem o step atual
    getStopTime() {
        return this.stopTime
    }

    setSimulationTime(step, stopTime) {
        this.stepSize = step;
        this.stopTime = stopTime;
        this.currentStep = 0;
    }

    // Obtém o array de tempo total
    getTotalTimeArray() {
        return buildTotalTimeArray(this.stepSize, this.stopTime)
    }

    // Obtém o array de tempo até o passo de simulação atual
    getTimeArray() {
        return buildTimeArray(this.stepSize, this.currentStep)
    }

    // Congela o objeto
    freeze() {
        Object.freeze(this)
    }


}

const Simulation = new SimulationEngine()


export { SimulationEngine }
export default Simulation
