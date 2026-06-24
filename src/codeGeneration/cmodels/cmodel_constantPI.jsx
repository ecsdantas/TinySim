const PiModel = function(node) {
    this.addLibsH__define('#define _USE_MATH_DEFINES')
    this.addLibsH__include('#include <math.h>')

    return 'M_PI';

};

export { PiModel }