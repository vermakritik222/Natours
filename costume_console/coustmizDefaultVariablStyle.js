const util = require('util');

const fun = () => {
    util.inspect.styles.string = 'magentaBright';
};
module.exports = fun;
