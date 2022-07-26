const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

//my requires
const registry = require('./modules/registry.js');

let nodesFullPathList = {};
let nodesRuntimeList = {};
let nodesResourceList = {};

function initInfraRED() {
    nodesFullPathList = registry.listAllNodes();
    for (let nodeFile of Object.keys(nodesFullPathList)) {
        //take out the .js of the string name, leaving the node name/identifier
        nodesRuntimeList[nodeFile.slice(0,-3)] = require(nodesFullPathList[nodeFile]);
    }
    nodesResourceList = registry.buildResourceList(nodesRuntimeList);
}

initInfraRED();
//this is okay for routing different files
app.use(express.static(path.join(__dirname, "assets")));

app.get('/', (req, res) => {
    initInfraRED();
    res.status(200).sendFile(path.join(__dirname, './assets/index.html'));
});

app.get('/listNodes', (req, res) => {
    console.log("Requesting nodes from the loader:\n");
    nodesResourceList = registry.buildResourceList(nodesRuntimeList);
    res.status(200).send(nodesResourceList);
    res.end();
});

//get the nodes
app.get("/nodes/:nodeName", (req, res) => {
    console.log(`Requesting node ${req.params.nodeName}`);
    console.log(nodesFullPath[req.params.nodeName]);
    res.status(200).send(nodesFullPath[req.params.nodeName]);
    res.end();
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