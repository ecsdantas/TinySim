// Small polynomial helpers used to compose the per-block Laplace transfer
// functions declared by `linearize()` (see linearize.jsx) into a single
// composite transfer function for the Frequency Scope block.
//
// Coefficients are ordered highest-order first, matching control-systems-js'
// convention (e.g. `s^2 + 3s + 1` -> [1, 3, 1]).

// Thrown by `linearize()` when a block in the signal path has no known
// Laplace representation (e.g. a nonlinear or discrete-time block). Carries
// the offending node so the caller can name it in the error shown to the user.
class LinearizationError extends Error {
    constructor(message, node) {
        super(message);
        this.name = 'LinearizationError';
        this.node = node;
    }
}

function multiplyPoly(a, b) {
    const result = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            result[i + j] += a[i] * b[j];
        }
    }
    return result;
}

// Adds two polynomials, right-aligning them (they represent the same
// "lowest order" term at the end of the array, regardless of length).
function addPoly(a, b) {
    const length = Math.max(a.length, b.length);
    const result = new Array(length).fill(0);
    for (let i = 0; i < a.length; i++) {
        result[length - a.length + i] += a[i];
    }
    for (let i = 0; i < b.length; i++) {
        result[length - b.length + i] += b[i];
    }
    return result;
}

function scalePoly(poly, k) {
    return poly.map((c) => c * k);
}

// Drops leading zero coefficients (keeps at least one term), since
// control-systems-js infers polynomial order from array length.
function trimLeadingZeros(poly) {
    let i = 0;
    while (i < poly.length - 1 && Math.abs(poly[i]) < 1e-12) i++;
    return poly.slice(i);
}

// Series connection (one block feeding the next): H(s) = H1(s) * H2(s)
function seriesTF(a, b) {
    return {
        numerator: multiplyPoly(a.numerator, b.numerator),
        denominator: multiplyPoly(a.denominator, b.denominator),
    };
}

// Parallel sum (e.g. an Add/Sub block combining branches): puts both terms
// over a common denominator. `sign` is -1 to subtract `b` instead of adding it.
function addTF(a, b, sign = 1) {
    return {
        numerator: addPoly(multiplyPoly(a.numerator, b.denominator), scalePoly(multiplyPoly(b.numerator, a.denominator), sign)),
        denominator: multiplyPoly(a.denominator, b.denominator),
    };
}

function logSpace(min, max, count) {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const step = (logMax - logMin) / Math.max(count - 1, 1);
    return Array.from({ length: count }, (_, i) => Math.pow(10, logMin + i * step));
}

export { LinearizationError, multiplyPoly, addPoly, scalePoly, trimLeadingZeros, seriesTF, addTF, logSpace };
