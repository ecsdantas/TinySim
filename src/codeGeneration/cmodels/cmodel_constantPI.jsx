const PiModel = function(node) {
    /*
    this.addModelC__vars(`#define PI ${Math.PI}`);
    return `PI`;
    */

    this.addLibsH__define('#define _USE_MATH_DEFINES')
    this.addLibsH__include('#include <math.h>')

    return 'M_PI';

};

export { PiModel }