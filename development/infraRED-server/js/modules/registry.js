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
        let nodeFileInfo = nodeFile.split('.');
        //take out the .js of the string name, leaving the node name/identifier
        let nodeName = nodeFileInfo[0];
        try {
            if (nodeFile.match(/^[A-Za-z]+\.js$/) === null) {
                throw new Error('Invalid file name, must contain only alphabet characters and must be .js files.');
            }
            //this require also throws errors based on faulty methods inside the node
            nodesRuntimeList[nodeName] = require(nodesFullPathList[nodeFile]);

            //TODO - here in the registry I probably need to make sure I'm loading nodes that are
            //correctly written, or at least possess the expected methods and attributes
            if (!(nodesRuntimeList[nodeName].hasOwnProperty('create') && nodesRuntimeList[nodeName].hasOwnProperty('load'))) {
                throw new Error('This node is built incorrectly, needs a "create" and "load" method.');
            }

            //TODO - and then load
            await nodesRuntimeList[nodeName].load();
            logger.log(`Loaded ${nodeName} node.`);

            buildResourceList(nodeName);

            resolve(nodeName);
        } catch (error) {
            //if the node fails to load we remove it from the runtime
            delete nodesRuntimeList[nodeName];
            logger.log(`Failed to load node from ${nodeFile}.`);
            reject({
                error: error.message, 
                who: nodeFile,
            });
        } 
    });
}

function buildResourceList(nodeName) {
    let node = nodesRuntimeList[nodeName].create();

    if (node.category == null) {
        throw new Error('This node is built incorrectly, needs a "category" object attribute.');
    } else if (node.properties == null) {
        throw new Error('This node is built incorrectly, needs a "properties" object attribute.');
    } else if (node.capabilities == null) {
        throw new Error('This node is built incorrectly, needs a "capabilities" object attribute.');
    } else if (node.requirements == null) {
        throw new Error('This node is built incorrectly, needs a "requirements" object attribute.');
    }

    //extract the properties from this node
    nodesResourceList[nodeName] = {
        category: node.category,
        properties: node.properties,
        capabilities: node.capabilities,
        requirements: node.requirements,
    };
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
                console.error(result);
            }
        });
    });
}

module.exports = {
    getPathList: () => { return nodesFullPathList; },

    buildRuntime: buildNodesRuntimeList,
    getRuntimeList: () => { return nodesRuntimeList; },
    
    getResourceList: () => { return nodesResourceList; },
};
