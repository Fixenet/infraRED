const path = require('path');
const fs = require('fs');

function traverseDirForFiles(dir) {
    let fileList = [];
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            fileList.push(...traverseDirForFiles(fullPath));
        } else {
            fileList.push(fullPath);
        }  
    });
    return fileList;
}

module.exports = function () {
    console.log("The registry module auto started because of the () at the end of the module.");
    console.log(traverseDirForFiles(path.join(__dirname, '../nodes')));
};