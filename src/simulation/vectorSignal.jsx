// Sinais vetoriais fluem como array JS comum pela mesma porta/link que hoje
// carrega um Number. Este guard evita corrupção silenciosa (concatenação de
// string, NaN) quando um bloco que só sabe lidar com escalares recebe um
// array vindo de um Mux/Demux.

class VectorSignalError extends Error {
    constructor(message, node) {
        super(message);
        this.name = 'VectorSignalError';
        this.node = node;
    }
}

function isVectorSignal(value) {
    return Array.isArray(value);
}

function assertScalar(value, blockLabel) {
    if (isVectorSignal(value)) {
        throw new VectorSignalError(`"${blockLabel}" não suporta sinal vetorial (recebeu um array de tamanho ${value.length})`);
    }
    return value;
}

export { isVectorSignal, assertScalar, VectorSignalError };
