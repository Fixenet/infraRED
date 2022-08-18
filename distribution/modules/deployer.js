let logger = require('./logger');
logger = logger.init('deployer');

const registry = require('./registry');

let nodesInPlayInstanceList = [];

async function cleanNodeInstances() {
    logger.log('Cleanup started.');

    let cleanupPromises = [];
    //call the cleanup for each node
    nodesInPlayInstanceList.forEach((nodeInstance) => {
        cleanupPromises.push(new Promise(async (resolve, reject) => {
            await nodeInstance.clean();
            resolve();
        }));
        
    });
    await Promise.allSettled(cleanupPromises).then(() => {
        nodesInPlayInstanceList = [];
        logger.log('Cleanup finished.');
    });
}

function createNodeInstances(nodesToDeploy) {
    for (let node of nodesToDeploy) {
        logger.log(`Deploying ${node.type}...`);
        nodesInPlayInstanceList.push(registry.getRuntimeList()[node.type].create());
    }
}

async function deployNodes(nodesToDeploy) {
    if (nodesInPlayInstanceList.length !== 0) await cleanNodeInstances();

    createNodeInstances(nodesToDeploy);

    let deployPromises = [];
    nodesInPlayInstanceList.forEach((nodeInstance) => {
        deployPromises.push(new Promise(async (resolve, reject) => {
            await nodeInstance.deploy();
            resolve();
        }));
    });

    Promise.allSettled(deployPromises).then(() => {
        logger.log('Deployment finished.');
    });
}

module.exports = {
    deployNodes: deployNodes,
};