class SimulationEngine {

    currentStep = 0
    time = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    stepSize = 1
    method = 0
    statelessMode = false
    saveLog = false
    model = null

    constructor(model){
        // Salva o modelo contendo todo o circuito
        this.model = model
        this.stepSize = (this.time[this.time.length - 1] - this.time[0])/this.time.length
    }

    // Define o modelo
    setModel(model){
        this.model = model
    }

    // Run simulation
    run(){

        // Verifica se consegue puxar os nós
        if (!this.model || !this.model.getNodes)
            return null

        // Obtém todos nós
        const nodes = this.model.getNodes();

        // Reseta o Step
        this.currentStep = 0;

        // Aplica o reset nos modelos que contém reset
        nodes.filter(node => node.reset).map(node => node.reset());

        // Inicio da simulação
        this.time.map( (time, step) => {

            // Registra o log
            console.log("Time[" + step + "] " + time)
 
            // Procura por outputs
            nodes.filter(node => node.isTerminalBlock).map( node => {
                node.solve()
            })

            // Incrementa o step
            this.currentStep += 1

        })

    }

    runStep(){
        // To be made...
    }

    // Obtem o step atual
    getCurrentStep(){
        return this.currentStep
    }

    getStepTime(){
        // return (this.time[this.time.length - 1] - this.time[0])/this.time.length
        return this.stepSize;
    }

    // Obtem o step atual
    getStopTime(){
        return this.time[this.time.length - 1]
    }

    // Obtem o step atual
    getTime(){
        return this.time
    }

    setSimulationTime(step, stopTime){
        const timeArr = [];
        const n = (stopTime / step)
        for(let s = 0; s <= n; s +=1  ){
            timeArr.push( s * step )
        };
        this.stepSize = step;
        this.currentStep = 0;
        this.time = timeArr;
    }

    // 
    freeze(){
        Object.freeze(this)
    }


}

const Simulation = new SimulationEngine()


export default Simulation
