// cmodel_add.jsx
import { makeArrayReduceCModel } from './_arrayReduceCModel';

const AddModel = makeArrayReduceCModel({
    suffix: 'add',
    cFunctionName: 'add',
    cFunctionBody:
`    double sum = 0.0;
    for (int i = 0; i < size; i++) { sum += array[i]; }
    return sum;`
});

export { AddModel };
