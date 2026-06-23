// cmodel_PIDcontroller.jsx
const PIDControllerModel = function (node) {
    const outputVar = `var_${node.CGenUID}_output`;

    // Verifica se a variável já foi utilizada
    if (node.isvisited) {
        return outputVar;
    }

    node.isvisited = true;

    // Adiciona a implementação da função `pid_controller`
    this.addLibsC__functions(`
void pid_controller(double setpoint, double input, double* integral, double* prevError, double kp, double ki, double kd, double* timestep, double* output) {
    double error = setpoint - input;
    *integral += error * (*timestep);
    double derivative = (*timestep > 0) ? (error - *prevError) / (*timestep) : 0.0;
    *output = kp * error + ki * (*integral) + kd * derivative;
    *prevError = error;
}
    `);

    // Adiciona a declaração da função
    this.addLibsH__declaration(`void pid_controller(double setpoint, double input, double* integral, double* prevError, double kp, double ki, double kd, double* timestep, double* output);`);

    // Recupera os nós conectados como entradas (0 = setpoint, 1 = process value)
    const setpointVar = this.getNode(node.getNodeByInput(0));
    const inputVar = this.getNode(node.getNodeByInput(1));

    // Cria as variáveis de estado e saída
    const integralVar = `var_${node.CGenUID}_integral`;
    const prevErrorVar = `var_${node.CGenUID}_prevError`;
    this.addModelC__vars(`static double ${integralVar} = 0.0;`);
    this.addModelC__vars(`static double ${prevErrorVar} = 0.0;`);
    this.addModelC__vars(`double ${outputVar};`);

    // Adiciona a chamada ao modelo PID no passo de execução
    this.addModelC__step(`pid_controller(${setpointVar}, ${inputVar}, &${integralVar}, &${prevErrorVar}, ${node.kp}, ${node.ki}, ${node.kd}, &model->simulation.sampling_time, &${outputVar});`);

    return outputVar;
};

export { PIDControllerModel };
