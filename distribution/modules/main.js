//my requires
const registry = require('./registry.js');

//TODO - do deployment stuff like talk to other APIs
function deployNodes(nodesToDeploy) {
    for (let node of nodesToDeploy) {
        console.log(`Deploying ${node}...`);
        nodesInPlayInstanceList.push(nodesRuntimeList[node.type].create());
    }
}

module.exports = {
    init: registry.buildRuntime,
    listNodes: registry.getResourceList,
    deploy: deployNodes,
};