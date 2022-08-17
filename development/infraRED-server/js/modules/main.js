//abstract infraRED server functionality to express server through this "middlewear"

//my requires
const registry = require('./registry');
const deployer = require('./deployer');

module.exports = {
    init: registry.buildRuntime,
    listNodes: registry.getResourceList,
    deploy: deployer.deployNodes,
};