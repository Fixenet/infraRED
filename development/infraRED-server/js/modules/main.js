//abstract infraRED server functionality to express server through this "middlewear"

//my requires
const registry = require('./registry');
const deployer = require('./deployer');
const database = require('./database');

module.exports = {
    init: registry.buildRuntime,
    listNodes: registry.getResourceList,
    savePattern: database.savePattern,
    destroyAll: deployer.destroyNodes,
    deploy: deployer.deployNodes,
};