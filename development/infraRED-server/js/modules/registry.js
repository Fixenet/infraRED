const path = require('path');
const fs = require('fs');
const moment = require('moment');

let logger = require('./logger');
logger = logger.init('Registry');

function traverseDirForFiles(dir) {
    let fileList = {};
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            fileList = Object.assign(traverseDirForFiles(fullPath), fileList);
        } else {
            fileList[file] = fullPath;
        }  
    });
    return fileList;
}

let nodesFullPathList = {}; //1st I get the path to the nodes
let nodesRuntimeList = {}; //2nd I require all nodes and build a list of their exports, effectively a runtime list
let nodesResourceList = {}; //3rd I use the method 'create' that all runtimes provide and use it to access each node's properties
                            //building the resource to show the user

function buildNodesFullPathList() {
    nodesFullPathList = traverseDirForFiles(path.join(__dirname, '../nodes'));
    return nodesFullPathList;
}

function loadNode(nodeFile) {
    return new Promise(async (resolve, reject) => {
        //take out the .js of the string name, leaving the node name/identifier
        let nodeName = nodeFile.slice(0,-3);
        try {
            nodesRuntimeList[nodeName] = require(nodesFullPathList[nodeFile]);
            await nodesRuntimeList[nodeName].load();
            logger.log(`Loaded ${nodeName} node.`);
            resolve(nodeName);
        } catch (error) {
            //if the node fails to load we remove it from the runtime
            delete nodesRuntimeList[nodeName];
            logger.log(`Failed to load ${nodeName} node.`);
            reject({
                error: error.message, 
                who: nodeName
            });
        } 
    });
}

function buildResourceList() {
    for (let nodeName in nodesRuntimeList) {
        //create a fake instance
        let node = nodesRuntimeList[nodeName].create();

        //extract the properties from this node
        nodesResourceList[nodeName] = {
            category: node.category,
            capabilities: node.capabilities,
            requirements: node.requirements,
        };
    }
}

async function buildNodesRuntimeList() {
    buildNodesFullPathList();

    let loaderPromises = [];
    for (let nodeFile of Object.keys(nodesFullPathList)) {
        //creates a promise for each different node type's initial load
        //this way node load time is independent of each other
        //only later will the initializer wait for every loader to finish via Promise.allSettled
        let nodeLoader = loadNode(nodeFile);
        loaderPromises.push(nodeLoader);
    }

    //allSettled means that the 'then' will only execute when all promises either resolved or rejected
    await Promise.allSettled(loaderPromises).then((results) => {
        results.forEach((result) => {
            //TODO - handle informing client of rejected loadings and/or retry
            if (result.status === 'rejected') {
            }
        });
    });

    buildResourceList();
}

module.exports = {
    getPathList: () => { return nodesFullPathList; },

    buildRuntime: buildNodesRuntimeList,
    getRuntimeList: () => { return nodesRuntimeList; },
    
    getResourceList: () => { return nodesResourceList; },
};
