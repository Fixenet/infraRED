let logger = require('./logger');
logger = logger.init('Database');

const deployer = require('./deployer');

//patterns saved as name: JSON string
let database = {};

function saveTemplate(name, nodes) {
    let orderedNodes = deployer.orderNodes(nodes);
    database[name] = JSON.stringify(orderedNodes);
    console.log(database);
}

module.exports = {
    saveTemplate: saveTemplate,
};