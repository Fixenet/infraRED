const express = require('express');
const path = require('path');

const moment = require("moment");

const app = express();
const port = 3000;

//my requires
const registry = require('./modules/registry.js');

let nodesFullPathList = {};
let nodesRuntimeList = {};
let nodesResourceList = {};

function loadNode(nodeFile) {
    return new Promise(async (resolve, reject) => {
        let nodeName = nodeFile.slice(0,-3);
        try {
            //take out the .js of the string name, leaving the node name/identifier
            nodesRuntimeList[nodeName] = require(nodesFullPathList[nodeFile]);
            await nodesRuntimeList[nodeName].load();
            console.log(`${moment().format('h:mm:ss a')} - Loaded ${nodeName} node.`);
            resolve(nodeName);
        } catch (error) {
            //if the node fails to load we remove it from the run time
            delete nodesRuntimeList[nodeName];
            console.log(`${moment().format('h:mm:ss a')} - Failed to load ${nodeName} node.`);
            reject({
                error: error.message, 
                who: nodeName
            });
        } 
    });
}

async function initInfraRED() {
    nodesFullPathList = registry.listAllNodes();

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
        nodesResourceList = registry.buildResourceList(nodesRuntimeList);
        results.forEach((result) => {
            //TODO - handle informing client of rejected loadings and/or retry
            if (result.status === 'rejected') {
            }
        });
    });
}

app.get('/infraRED.js', (req, res) => {
    console.log('Sending infraRED.js ...');
    res.sendFile(path.join(__dirname, './infraRED.js'), (error) => {
        if (error) console.error(error);
        res.end();
    });
});

app.get('/', async (req, res) => {
    //TODO - client needs to be aware of this process starting
    console.log('Initializing nodes ...');
    await initInfraRED();
    //TODO - client needs to be aware of this being complete
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
    
    //TEST - send back to the client for reading values on browser
    res.status(200).send(req.body);
    res.end();
});

app.listen(port, () => {
    console.log(`infraRED app listening on port ${port}`);
});