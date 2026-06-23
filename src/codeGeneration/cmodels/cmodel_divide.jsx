// cmodel_divide.jsx
import { makeArrayReduceCModel } from './_arrayReduceCModel';

const DivideModel = makeArrayReduceCModel({
    suffix: 'divide',
    cFunctionName: 'divide',
    includes: ['#include <math.h>'], // for NAN
    cFunctionBody:
`    double result = array[0];
    for (int i = 1; i < size; i++) {
        if (array[i] == 0) return NAN; // Avoid division by zero
        result /= array[i];
    }
    return result;`
});

export { DivideModel };
