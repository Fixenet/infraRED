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

module.exports = {
    init() {
        console.log("The registry module auto started because of the () at the end of the module.");    
    },
    listAllNodes() {
        let files = traverseDirForFiles(path.join(__dirname, '../nodes'));
        return files;
    },
};
