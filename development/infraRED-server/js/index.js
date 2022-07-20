const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

//my requiress
const registry = require('./modules/registry.js');

//this is okay for routing different files
app.use(express.static(path.join(__dirname, "assets")));

app.get('/', (req, res) => {
    console.log("Sending index.html");
    res.status(200).sendFile(path.join(__dirname, './assets/index.html'));
});

registry();
app.get('/listNodes', (req, res) => {
    console.log("Requesting nodes from the loader:\n");

    registry();

    res.status(200).send(nodesFullPath);
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