const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

//my requires
const registry = require('./modules/registry.js');

let nodesFullPathList = {};
let nodesRuntimeList = {};
let nodesResourceList = {};

async function initInfraRED() {
    nodesFullPathList = registry.listAllNodes();
    for (let nodeFile of Object.keys(nodesFullPathList)) {
        //take out the .js of the string name, leaving the node name/identifier
        let nodeName = nodeFile.slice(0,-3);
        nodesRuntimeList[nodeName] = require(nodesFullPathList[nodeFile]);
        console.log(`\n----- ${nodeName} -----`);
        
        //TODO - i can't await for every single node to load individually
        await nodesRuntimeList[nodeName].load();

    }
    nodesResourceList = registry.buildResourceList(nodesRuntimeList);
}

app.get('/', async (req, res) => {
    console.log('Initializing nodes...');
    await initInfraRED();
    console.log('Finished initializing nodes.');
    res.status(200).sendFile(path.join(__dirname, './assets/index.html'));
});

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/listNodes', (req, res) => {
    console.log('Requesting nodes from the loader.');
    nodesResourceList = registry.buildResourceList(nodesRuntimeList);
    res.status(200).send(nodesResourceList);
    res.end();
});

//get the nodes
app.get('/nodes/:nodeName', (req, res) => {
    console.log(`Requesting node ${req.params.nodeName}.`);
    console.log(nodesFullPath[req.params.nodeName]);
    res.status(200).send(nodesFullPath[req.params.nodeName]);
    res.end();
});

app.use(express.json()); 
app.post('/deploy', (req, res) => {
    console.log('Deployment request arrived at server.');

    let nodesToDeploy = req.body.nodes;

    //TODO do deployment stuff like talk to other APIs
    console.log(nodesToDeploy[0].type);
    nodesRuntimeList[nodesToDeploy[0].type].deploy();
    
    //TODO for reading values on chrome
    res.status(200).send(req.body);
    res.end();
});

app.listen(port, () => {
    console.log(`infraRED app listening on port ${port}`);
});

function Hello() {
    this.name = "name";
}


let hello1 = new Hello();
hello1.name = "bitch";
console.log(hello1.name);


let hello2 = new Hello();
console.log(hello2.name);