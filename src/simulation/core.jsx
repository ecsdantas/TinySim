class SimulationEngine {

    currentStep = 0
    currentTime = 0
    stepSize = 1
    stopTime = 10
    method = 0 // método de integração: 0 = ODE1, 1 = ODE2... a ser implementado
    statelessMode = false
    saveLog = true
    #model = null
    #nodes = null
    realTimeMode = false
    emergencyStop = false
    isSimulationRunning = false

    constructor(model){
        // Salva o modelo contendo todo o circuito
        this.#model = model;
        this.runStep = this.runStep.bind(this);
        this.runStandard = this.runStandard.bind(this);
        this.runRealTime = this.runRealTime.bind(this);
        this.resetSimulation = this.resetSimulation.bind(this);
    }

    // Define o modelo
    setModel(model){
        this.#model = model
        this.runSetup()
    }

    runSetup(){
        // Impede a simulação de continuar
        if(this.isSimulationRunning){
            this.emergencyStop = true
            this.isSimulationRunning = false
            return false
        }

        // Verifica se consegue puxar os nós
        if (!this.#model || !this.#model.getNodes)
            return false

        // Obtém todos nós
        this.#nodes = this.#model.getNodes();

        return true
    }

    // Run simulation
    run(){

        // Run setup first
        if(!this.runSetup()){
            return
        }
        
        // Reseta a simulação
        this.resetSimulation()

        // Habilita a flag de simulação
        this.isSimulationRunning = true
        
        // Log de simulação
        this.saveLog && console.log("==== Simulation is starting ====")

        // Simula
        const sim = this.realTimeMode? this.runRealTime : this.runStandard
        sim()
        
    }

    // Simula no modo padrão
    runStandard(){
        
        // Inicio da simulação
        while( (this.stopTime >= this.currentTime) && (!this.emergencyStop) ){
            this.runStep() // Roda o passo
        }

        // Desabilita a flag de simulação
        this.isSimulationRunning = false

    }

    // Simula com sincronismo em tempo real
    runRealTime(){

        // Update rate of realtime
        this.stepSize = 0.2;
        
        // Função para rodar
        const sync = () => {
            setTimeout(() => {
                (!this.emergencyStop) && sync(); // Chama uma nova instância
            }, this.stepSize * 1E3)
            this.runStep()   
        }

        // Inicia a simulação e só para com o emergencyStop
        sync()        

    }

    // Roda um passo de simulação
    runStep(){

        // Registra o log
        this.saveLog && console.log("Time[" + this.currentStep + "] " + this.currentTime)

        // Procura por outputs
        this.#nodes.filter(node => node.isTerminalBlock).map( node => {
            node.solution() // Chama diretamente a solução
        })

        // Incrementa o step
        this.currentStep += 1
        this.currentTime += this.stepSize

    }

    resetSimulation(){
        
        // Reseta o Step e o  time
        this.currentStep = 0;
        this.currentTime = 0;
        this.emergencyStop = false
        this.isSimulationRunning = false

        // Reseta o console
        this.saveLog && console.clear()

        // Aplica o reset nos modelos que contém reset
        this.#nodes.filter(node => node.reset).map(node => node.reset());

    }

    // Obtem o step atual
    getCurrentStep(){
        return this.currentStep
    }

    getCurrentTime(){
        return this.currentTime
    }

    getStepTime(){
        return this.stepSize
    }

    // Obtem o step atual
    getStopTime(){
        return this.stopTime 
    }

    // Obtém o tempo atual 
    getTime(){
        return this.currentTime
    }

    // Obtém o tempo atual 
    getCurrentTime(){
        return this.currentTime
    }

    setSimulationTime(step, stopTime){
        this.stepSize = step;
        this.stopTime = stopTime;
        this.currentStep = 0;
    }

    // Obtém o array de tempo total
    getTotalTimeArray(){
        const timeArr = [];
        const n = (this.stopTime / this.stepSize)
        for(let s = 0; s <= n + 1; s +=1  ){
            timeArr.push( s * this.stepSize )
        };
        return timeArr
    }

    // Obtém o array de tempo até o passo de simulação atual
    getTimeArray(){
        const timeArr = [];
        for(let s = 0; s < this.currentStep; s +=1  ){
            timeArr.push( s * this.stepSize )
        };
        return timeArr
    }

    // Congela o objeto
    freeze(){
        Object.freeze(this)
    }


}

const Simulation = new SimulationEngine()


export default Simulation
