const path = require('path');
const fs = require('fs');

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

function listAllNodes() {
    return traverseDirForFiles(path.join(__dirname, '../nodes'));
}

function buildResourceList(nodesRuntimeList) {
    let resourceList = {};

    for (let node in nodesRuntimeList) {
        console.log(`\n----- ${node} -----`);
        nodesRuntimeList[node].init();

        resourceList[node] = {
            capabilities: nodesRuntimeList[node].self().capabilities,
            requirements: nodesRuntimeList[node].self().requirements,
        };
    }
    
    return resourceList;
}

module.exports = {
    init() {
        console.log("The registry module auto started because of the () at the end of the module.");    
    },
    listAllNodes: listAllNodes,
    buildResourceList: buildResourceList,
};
