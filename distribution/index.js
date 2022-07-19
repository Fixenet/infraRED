const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

const fs = require('fs');

//my requiress
const registry = require('./modules/registry.js');

//this is okay for routing different files
app.use(express.static(path.join(__dirname, "assets")));

app.get('/', (req, res) => {
    console.log("Sending index.html");
    res.status(200).sendFile(path.join(__dirname, './assets/index.html'));
});

function traverseDirForFiles(dir) {
    let fileList = [];
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            fileList.push(...traverseDirForFiles(fullPath));
        } else {
            fileList.push(file);
        }  
    });
    return fileList;
}

console.log(traverseDirForFiles(path.join(__dirname, '/nodes')));
app.get('/listNodes', (req, res) => {
    console.log("Requesting nodes from the loader:\n");
    
    let files = traverseDirForFiles(path.join(__dirname, '/nodes'));

    res.status(200).send(files);
    res.end();
});

//get the nodes
app.get("/nodes/:nodeName", (req, res) => {
    console.log(`Requesting node ${req.params.nodeName}`);
    res.status(200).end();
});

app.get('/deploy', (req, res) => {
    console.log(`Deployment request arrived at server.`);

    console.log(req.query);
    //TODO do deployment stuff like talk to other APIs

    res.status(200).send("Deployment has concluded in server.");
    res.end();
});

app.listen(port, () => {
    console.log(`infraRED app listening on port ${port}`);
});