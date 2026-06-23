// Pure helpers for building the time axis used by plots/exports.
function buildTotalTimeArray(stepSize, stopTime) {
    const timeArr = [];
    const n = (stopTime / stepSize)
    for (let s = 0; s <= n + 1; s += 1) {
        timeArr.push(s * stepSize)
    }
    return timeArr
}

function buildTimeArray(stepSize, currentStep) {
    const timeArr = [];
    for (let s = 0; s < currentStep; s += 1) {
        timeArr.push(s * stepSize)
    }
    return timeArr
}

export { buildTotalTimeArray, buildTimeArray }
