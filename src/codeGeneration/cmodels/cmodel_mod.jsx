// cmodel_mod.jsx
import { makeArrayReduceCModel } from './_arrayReduceCModel';

const ModModel = makeArrayReduceCModel({
    suffix: 'mod',
    cFunctionName: 'mod',
    includes: ['#include <math.h>'], // for fmod / NAN
    cFunctionBody:
`    double result = array[0];
    for (int i = 1; i < size; i++) {
        if (array[i] == 0) return NAN; // Avoid division by zero
        result = fmod(result, array[i]);
    }
    return result;`
});

export { ModModel };
