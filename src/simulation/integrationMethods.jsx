// Explicit fixed-step ODE solvers shared by every dynamic block (Integrator,
// FirstOrder, ...). The block diagram is only re-evaluated once per main
// step, so the input driving a state is treated as held constant over the
// step (zero-order hold) — consistent with how the rest of the engine already
// samples upstream blocks once per step. Under that assumption the methods
// below solve dy/dt = u - a*y exactly for a constant a*y term, with RK2/RK4
// only improving accuracy over Euler when a*dt is not small (e.g. FirstOrder
// with a large damping factor); for a plain integrator (a = 0) every method
// is algebraically identical since the derivative does not depend on y.

const EULER = 0
const HEUN = 1   // RK2
const RK4 = 2

const INTEGRATION_METHODS = [
    { value: EULER, label: 'Euler (RK1)' },
    { value: HEUN, label: 'Heun (RK2)' },
    { value: RK4, label: 'Runge-Kutta 4 (RK4)' },
]

// Solves one step of dy/dt = u - a*y, with u and a held constant over dt.
function integrateLinearODE(method, y, u, a, dt) {
    const f = (state) => u - a * state

    switch (method) {

        case HEUN: {
            const k1 = f(y)
            const k2 = f(y + dt * k1)
            return y + (dt / 2) * (k1 + k2)
        }

        case RK4: {
            const k1 = f(y)
            const k2 = f(y + (dt / 2) * k1)
            const k3 = f(y + (dt / 2) * k2)
            const k4 = f(y + dt * k3)
            return y + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
        }

        case EULER:
        default:
            return y + dt * f(y)
    }
}

export { EULER, HEUN, RK4, INTEGRATION_METHODS, integrateLinearODE }
