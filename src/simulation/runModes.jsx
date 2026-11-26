// Laços de execução (modo padrão e tempo real). Ambos só tocam a superfície
// pública do engine (runStep, stopTime, currentTime, getStepTime,
// isSimulationRunning, emergencyStop, notifyProgress), então recebem a
// própria instância do engine em vez de duplicar seu estado.
//
// Os dois laços são ASSÍNCRONOS: o modo padrão processa os passos em
// "fatias" (por tempo de parede ou número de passos) e devolve o controle ao
// browser entre elas, para a interface não travar e o botão Stop funcionar.
// O passo individual (engine.runStep) continua síncrono.
//
// Contrato comum:
//   loop(engine, { isCurrent, onDone, ... }) -> Promise<boolean>
//   - isCurrent(): false quando esta execução foi substituída/encerrada pelo
//     engine (ex.: stop() ou um novo run()); o laço então para em silêncio,
//     sem chamar onDone.
//   - onDone(completed): chamado de forma SÍNCRONA quando o laço termina por
//     conta própria (completed = true se chegou ao stopTime, false se parou
//     por emergencyStop/isSimulationRunning = false).
//   - A Promise resolve com o mesmo `completed` (false se foi substituída).

const DEFAULT_CHUNK_MS = 16
const DEFAULT_MAX_STEPS_PER_CHUNK = Infinity
const REAL_TIME_STEP_SIZE = 0.2

const defaultNow = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()

// Devolve o controle ao event loop. MessageChannel evita o clamp de ~4 ms do
// setTimeout(0) aninhado nos browsers; cai para setTimeout se não existir.
let channel = null
const channelQueue = []
function yieldToEventLoop(callback) {
    if (typeof MessageChannel === 'undefined') {
        setTimeout(callback, 0)
        return
    }
    if (!channel) {
        channel = new MessageChannel()
        channel.port1.onmessage = () => {
            const next = channelQueue.shift()
            next && next()
        }
    }
    channelQueue.push(callback)
    channel.port2.postMessage(null)
}

// true enquanto o tempo atual ainda não passou do stopTime. A pequena
// tolerância (relativa ao passo) evita perder o último passo por erro de
// ponto flutuante (ex.: 3 * 0.3 = 0.8999999999999999 vs. stopTime 0.9 já é
// coberto; o caso inverso, k*dt um ulp ACIMA do stopTime, também).
function hasTimeLeft(engine) {
    const tolerance = Math.abs(engine.getStepTime()) * 1e-9
    return engine.currentTime <= engine.stopTime + tolerance
}

function canContinue(engine, isCurrent) {
    return isCurrent() && !engine.emergencyStop && engine.isSimulationRunning
}

function runStandardLoop(engine, options = {}) {
    const {
        isCurrent = () => true,
        onDone = () => { },
        chunkMs = DEFAULT_CHUNK_MS,
        maxStepsPerChunk = DEFAULT_MAX_STEPS_PER_CHUNK,
        now = defaultNow,
        yieldFn = yieldToEventLoop,
    } = options

    return new Promise(resolve => {
        const chunk = () => {
            if (!isCurrent()) {
                resolve(false)
                return
            }

            const start = now()
            let steps = 0
            while (canContinue(engine, isCurrent) && hasTimeLeft(engine)) {
                engine.runStep()
                steps += 1
                if (steps >= maxStepsPerChunk || (now() - start) >= chunkMs) break
            }

            if (!isCurrent()) {
                resolve(false)
                return
            }

            const stopped = engine.emergencyStop || !engine.isSimulationRunning
            if (stopped || !hasTimeLeft(engine)) {
                const completed = !stopped
                onDone(completed)
                resolve(completed)
                return
            }

            engine.notifyProgress && engine.notifyProgress()
            yieldFn(chunk)
        }

        chunk()
    })
}

// Tempo real: um passo a cada stepSize segundos de relógio. Não tem fim
// natural (roda até o usuário parar), então só termina por stop/erro.
function runRealTimeLoop(engine, options = {}) {
    const {
        isCurrent = () => true,
        onDone = () => { },
    } = options

    return new Promise(resolve => {
        const tick = () => {
            if (!isCurrent()) {
                resolve(false)
                return
            }
            if (!canContinue(engine, isCurrent)) {
                onDone(false)
                resolve(false)
                return
            }

            engine.runStep()
            engine.notifyProgress && engine.notifyProgress()
            setTimeout(tick, engine.getStepTime() * 1E3)
        }

        tick()
    })
}

export { runStandardLoop, runRealTimeLoop, hasTimeLeft, yieldToEventLoop, REAL_TIME_STEP_SIZE }
