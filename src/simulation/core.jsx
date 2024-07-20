class SimulationEngine {

    currentStep = 0
    time = [1, 2, 3, 4]
    method = 0
    statelessMode = false
    saveLog = false
    model = null

    constructor(model){
        // Salva o modelo contendo todo o circuito
        this.model = model
    }

    // Define o modelo
    setModel(model){
        this.model = model
    }

    // Run simulation
    run(){

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

    // Obtem o step atual
    getStep(){
        return this.currentStep
    }

    static freeze(){
        Object.freeze(this)
    }


}

const Simulation = new SimulationEngine()


export default Simulation
