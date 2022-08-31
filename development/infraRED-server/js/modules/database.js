let logger = require('./logger');
logger = logger.init('Database');

const deployer = require('./deployer');

//patterns saved as name: JSON string
let database = {};

function savePattern(name, nodes) {
    let orderedNodes = deployer.orderNodes(nodes);
    let orderedPattern = JSON.stringify(orderedNodes);
    database[name] = orderedPattern;
    return orderedPattern;
}

module.exports = {
    savePattern: savePattern,
};