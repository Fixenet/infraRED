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

//TODO - have this here in case i need to load this file separately 
app.get('/infraRED.js', (req, res) => {
    console.log('Sending infraRED.js ...');
    res.sendFile(path.join(__dirname, './infraRED.js'), (error) => {
        if (error) console.error(error);
        res.end();
    });
});

app.get('/', async (req, res) => {
    console.log('Initializing nodes ...');
    await initInfraRED();
    console.log('Finished initializing nodes.');

    //set up the asset folder for the client to get frontend files, no sensitive files should go here
    app.use(express.static(path.join(__dirname, './assets/')));

    console.log('Sending index.html ...');
    await res.status(200).sendFile(path.join(__dirname, './assets/index.html'), (error) => {
        if (error) console.error(error);
        res.end();
        console.log('Finished sending index.');
    });
});

app.get('/listNodes', (req, res) => {
    console.log('Requesting nodes from the loader.');
    nodesResourceList = registry.buildResourceList(nodesRuntimeList);
    res.status(200).send(nodesResourceList);
    res.end();
});

app.use(express.json()); 
app.post('/deploy', (req, res) => {
    console.log('Deployment request arrived at server.');
    let nodesToDeploy = req.body.nodes;

    //TODO - do deployment stuff like talk to other APIs
    console.log(nodesToDeploy[0]);
    nodesRuntimeList[nodesToDeploy[0].type].deploy();
    
    //TODO - for reading values on chrome
    res.status(200).send(req.body);
    res.end();
});

app.listen(port, () => {
    console.log(`infraRED app listening on port ${port}`);
});