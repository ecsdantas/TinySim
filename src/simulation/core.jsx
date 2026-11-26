import { toast } from "react-toastify"
import { setupSimulation } from "./setup"
import { solveTerminalNodes } from "./runStep"
import { runStandardLoop, runRealTimeLoop, REAL_TIME_STEP_SIZE } from "./runModes"
import { resetNodes } from "./reset"
import { buildTotalTimeArray, buildTimeArray } from "./timeArrays"
import { EULER } from "./integrationMethods"

class SimulationEngine {

    currentStep = 0
    currentTime = 0
    stepSize = 1              // passo configurado pelo usuário (settingsbar)
    stopTime = 10
    method = EULER // método de integração usado pelos blocos dinâmicos (ver integrationMethods.jsx)
    statelessMode = false
    saveLog = true
    #model = null
    #nodes = null
    realTimeMode = false
    emergencyStop = false
    isSimulationRunning = false
    chunkOptions = {}         // opções do laço em fatias (chunkMs, maxStepsPerChunk), ver runModes.jsx
    onProgress = null         // callback opcional; recebe o mesmo objeto de getProgress()
    #runStepSize = null       // passo da execução atual/última (tempo real usa 0.2 s sem tocar no stepSize do usuário)
    #runToken = 0             // identifica a execução ativa; laços antigos param quando ele muda
    #resolveRun = null
    #currentRun = null
    #listeners = new Set()

    constructor(model) {
        // Salva o modelo contendo todo o circuito
        this.#model = model;
        this.runStep = this.runStep.bind(this);
        this.runStandard = this.runStandard.bind(this);
        this.runRealTime = this.runRealTime.bind(this);
        this.resetSimulation = this.resetSimulation.bind(this);
        this.stop = this.stop.bind(this);
    }

    // true enquanto uma execução (padrão ou tempo real) está em andamento.
    // Usado por plot.jsx para só desenhar o gráfico no fim da execução.
    get isRunning() {
        return this.isSimulationRunning
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
                this.stop()
                return false
            }

            const result = setupSimulation(this.#model)
            if (!result.ok) {
                if (result.error === 'algebraic-loop') {
                    this.saveLog && console.error("Algebraic loop detected:", result.cycleLabels.join(' -> '))
                    toast.error(<div>Algebraic loop detected: {result.cycleLabels.join(' → ')}.<br />Add a state block (Integrator, Memory, ZOH...) to break the loop.</div>)
                    this.emergencyStop = true
                }
                return false
            }

            this.#nodes = result.nodes
            return true

        } catch (error) {
            console.error("Unable to set-up simulation environment")
            toast.error(<div>An error occurred while set-up the simulation envinronment</div>)
            this.emergencyStop = true;
            return false
        }

    }

    // Run simulation. Se já estiver rodando, funciona como Stop (botão
    // Run/Stop e ALT+1). Retorna uma Promise que resolve quando a execução
    // termina (true = chegou ao stopTime) ou é parada (false).
    run() {

        if (this.isSimulationRunning) {
            const current = this.#currentRun
            this.stop()
            return current ?? Promise.resolve(false)
        }

        // Run setup first
        if (!this.runSetup()) {
            return Promise.resolve(false)
        }

        // Reseta a simulação
        this.resetSimulation()

        // Habilita a flag de simulação
        this.isSimulationRunning = true

        // Log de simulação
        this.saveLog && console.log("==== Simulation is starting ====")

        // Simula
        return this.realTimeMode ? this.runRealTime() : this.runStandard()

    }

    // Simula no modo padrão (em fatias, sem travar a interface)
    runStandard() {
        this.#runStepSize = this.stepSize
        return this.#launch(runStandardLoop, this.chunkOptions)
    }

    // Simula com sincronismo em tempo real. Usa um passo fixo de
    // REAL_TIME_STEP_SIZE sem sobrescrever o stepSize escolhido pelo usuário.
    runRealTime() {
        this.#runStepSize = REAL_TIME_STEP_SIZE
        return this.#launch(runRealTimeLoop)
    }

    #launch(loop, options = {}) {
        // Resolve uma execução anterior que ainda esteja pendente
        this.#resolveRun && this.#resolveRun(false)

        const token = ++this.#runToken
        const promise = new Promise(resolve => { this.#resolveRun = resolve })
        this.#currentRun = promise
        this.notifyProgress()

        loop(this, {
            ...options,
            isCurrent: () => token === this.#runToken,
            onDone: completed => this.#finishRun(completed),
        })

        return promise
    }

    // Finaliza a execução ativa: baixa as flags, invalida o laço, redesenha
    // os blocos de saída (plots só desenham o gráfico quando !isRunning) e
    // avisa os inscritos.
    #finishRun(completed) {
        this.isSimulationRunning = false
        this.#runToken++
        this.#nodes && this.#nodes.filter(node => node.isTerminalBlock).forEach(node => node.update && node.update())
        this.saveLog && console.log(completed ? "==== Simulation finished ====" : "==== Simulation stopped ====")
        this.notifyProgress()
        const resolve = this.#resolveRun
        this.#resolveRun = null
        this.#currentRun = null
        resolve && resolve(completed)
    }

    // Para a execução em andamento (se houver). Os resultados até o passo
    // atual são mantidos; resetSimulation() os descarta.
    stop() {
        if (!this.isSimulationRunning && !this.#resolveRun) {
            return false
        }
        this.emergencyStop = true
        this.#finishRun(false)
        return true
    }

    // Progresso da execução, para a interface (menubar)
    getProgress() {
        const fraction = this.stopTime > 0 ? Math.min(1, Math.max(0, this.currentTime / this.stopTime)) : 1
        return {
            running: this.isSimulationRunning,
            realTime: this.realTimeMode,
            currentTime: this.currentTime,
            currentStep: this.currentStep,
            stopTime: this.stopTime,
            fraction,
        }
    }

    // Inscreve um callback de progresso; retorna a função para cancelar
    subscribe(listener) {
        this.#listeners.add(listener)
        return () => { this.#listeners.delete(listener) }
    }

    notifyProgress() {
        if (this.#listeners.size === 0 && !this.onProgress) return
        const progress = this.getProgress()
        const callbacks = [...this.#listeners]
        this.onProgress && callbacks.push(this.onProgress)
        callbacks.forEach(listener => {
            try {
                listener(progress)
            } catch (error) {
                this.saveLog && console.error("Progress listener failed:", error)
            }
        })
    }

    // Roda um passo de simulação (síncrono)
    runStep() {

        try {
            // Procura por outputs e resolve cada um
            solveTerminalNodes(this.#nodes, this.saveLog, this.currentStep, this.currentTime)

            // Incrementa o step. O tempo é recalculado a partir do número de
            // passos (e não acumulado), para não somar erro de ponto
            // flutuante: com dt = 0.1, 1000 passos dão exatamente 100.
            this.currentStep += 1
            this.currentTime = this.currentStep * this.getStepTime()
        } catch (error) {
            this.saveLog && console.error("An error occurred during simulation step:", error);
            toast.error(<div>An error occurred at step {this.currentStep}.<br />Did you place an output block?</div>)
            this.emergencyStop = true;
        }
    }

    resetSimulation() {

        // Para uma execução em andamento antes de resetar
        this.isSimulationRunning && this.stop()

        // Volta a usar o passo do usuário (descarta o passo de tempo real)
        this.#runStepSize = null

        // Reseta o Step e o  time
        this.currentStep = 0;
        this.currentTime = 0;
        this.emergencyStop = false
        this.isSimulationRunning = false

        // Reseta o console
        this.saveLog && console.clear()

        // Aplica o reset nos modelos que contém reset
        resetNodes(this.#nodes)

        this.notifyProgress()

    }

    // Obtem o step atual
    getCurrentStep() {
        return this.currentStep
    }

    getCurrentTime() {
        return this.currentTime
    }

    // Passo efetivo: o da execução atual/última (0.2 s em tempo real) ou,
    // fora de uma execução, o stepSize configurado pelo usuário.
    getStepTime() {
        return this.#runStepSize ?? this.stepSize
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

    // Durante uma execução só a configuração muda (vale para a próxima
    // execução); o passo efetivo e os contadores da execução atual ficam.
    setSimulationTime(step, stopTime) {
        this.stepSize = step;
        this.stopTime = stopTime;
        if (this.isSimulationRunning) return
        this.#runStepSize = null
        this.currentStep = 0;
        this.currentTime = 0;
    }

    // Obtém o array de tempo total
    getTotalTimeArray() {
        return buildTotalTimeArray(this.getStepTime(), this.stopTime)
    }

    // Obtém o array de tempo até o passo de simulação atual
    getTimeArray() {
        return buildTimeArray(this.getStepTime(), this.currentStep)
    }

    // Congela o objeto
    freeze() {
        Object.freeze(this)
    }


}

const Simulation = new SimulationEngine()


export { SimulationEngine }
export default Simulation
