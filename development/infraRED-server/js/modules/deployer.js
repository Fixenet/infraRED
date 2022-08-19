let logger = require('./logger');
logger = logger.init('Deployer');

const registry = require('./registry');

let currentMaxLevel = 0;
let orderedNodeInstances = {};

async function cleanNodeInstances() {
    logger.newLine();
    logger.log('Cleanup started.');
    for (let level in orderedNodeInstances) {
        let cleanupPromises = [];
        //for cleanup, start at highest level and go down to 0
        for (let node of orderedNodeInstances[currentMaxLevel - level]) {
            //call the cleanup for each node
            cleanupPromises.push(node.clean());
        }
        await Promise.allSettled(cleanupPromises);
        logger.log(`Cleanup finished at level ${currentMaxLevel - level}.`);
    }
    orderedNodeInstances = {};
    logger.log('Cleanup finished!');
    logger.newLine();
}

//DEPLOYMENT ALGORITHM
//ordered by levels of deployment
//level 1 deploys first and has nodes with no requirements
//level 2 deploys second and only has nodes with requirements fulfilled by level 1 deployments
//level N deploys Nth and only has nodes with requirements fulfilled by levels less than N deployments
function lookupRelashionships(level, orderedNodes, nodesToDeploy) {
    let currentLevelList = [];
    for (let nodeIndex = 0; nodeIndex < nodesToDeploy.length; nodeIndex++) {
        let node = nodesToDeploy[nodeIndex];
        let nodeID = node.canvasID;

        let appendToCurrentLevel = true;

        let requirementsCount = 0; //counts the number of requirements this node has
        let requirementsFulfilledCount = 0; //then counts if that requirement has a deployed capability already

        for (let relationship of node.relationships) {
            //node participates in its relationship as a requirement so we need to check for capabilities already being deployed
            if (relationship.requirement.nodeID === nodeID) {
                if (level === 0) { //level 0 skip, node participates as a requirement so can't have it in level 0, STOP looking
                    appendToCurrentLevel = false;
                    break; //stop
                } else { //level 1+
                    requirementsCount++; //this node has a requirement that needs to be fulfilled

                    //we need to check if the relationship is fulfilled by a previous level
                    for (let levelIndex = 0; levelIndex < level; levelIndex++) {
                        for (let capabilityNode of orderedNodes[levelIndex]) {
                            //good, the requirement is being fulfilled by a capability of a node
                            //that is being deployed before this one
                            if (relationship.capability.nodeID === capabilityNode.canvasID) {
                                requirementsFulfilledCount++;
                            }
                        }
                    }
                }
            }
        }

        //parsed this node's relationships and it has no requirement that isn't already being deployed
        if (appendToCurrentLevel && requirementsCount === requirementsFulfilledCount) { 
            currentLevelList.push(node);
            nodesToDeploy.splice(nodeIndex--, 1); //remove it
        }
    }
    return currentLevelList;
}
function orderNodesByHierarchy(nodesToDeploy) {
    let orderedNodes = {};
    let currentLevel = 0;

    while (nodesToDeploy.length !== 0) {
        if (currentLevel > 1000) throw Error('Circular reference in node design.');
        orderedNodes[currentLevel] = lookupRelashionships(currentLevel++, orderedNodes, nodesToDeploy);
    }

    currentMaxLevel = currentLevel-1;
    return orderedNodes;
}

function createNodeInstances(nodesToDeploy) {
    let orderedInstances = {};
    for (let level in nodesToDeploy) {
        orderedInstances[level] = [];
        for (let node of Object.values(nodesToDeploy[level])) {
            //push a node instance
            logger.log(`Creating instance for ${node.type} at level ${level} ...`);
            orderedInstances[level].push(registry.getRuntimeList()[node.type].create());
        }
    }
    return orderedInstances;
}

async function deployNodes(nodesToDeploy) {
    //TODO - not used anymore, i may still need it
    if (Object.keys(orderedNodeInstances).length !== 0) await cleanNodeInstances();

    //{ levelN: nodes, levelN+1: nodes, ... }
    let orderedNodesToDeploy = orderNodesByHierarchy(nodesToDeploy);

    //{ levelN: nodeInstances, levelN+1: nodeInstances, ... }
    orderedNodeInstances = createNodeInstances(orderedNodesToDeploy);

    logger.newLine();
    logger.log('Deployment started!');
    for (let level in orderedNodeInstances) {
        let currentLevelDeployPromises = [];

        for (let node of orderedNodeInstances[level]) {
            currentLevelDeployPromises.push(node.deploy());
        }

        await Promise.allSettled(currentLevelDeployPromises);
        logger.log(`Deployment finished at level ${level}.`);
    }
    logger.log('Deployment finished!');
    logger.newLine();
}

module.exports = {
    deployNodes: deployNodes,
};