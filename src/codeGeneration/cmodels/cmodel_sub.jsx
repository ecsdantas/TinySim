// cmodel_subtract.jsx
import { makeArrayReduceCModel } from './_arrayReduceCModel';

const SubModel = makeArrayReduceCModel({
    suffix: 'sub',
    cFunctionName: 'sub',
    cFunctionBody:
`    double sum = array[0];
    for (int i = 1; i < size; i++) { sum -= array[i]; }
    return sum;`
});

export { SubModel };
