// cmodel_multiply.jsx
import { makeArrayReduceCModel } from './_arrayReduceCModel';

const MultiplyModel = makeArrayReduceCModel({
    suffix: 'multiply',
    cFunctionName: 'multiply',
    cFunctionBody:
`    double result = array[0];
    for (int i = 1; i < size; i++) {
        result *= array[i];
    }
    return result;`
});

export { MultiplyModel };
