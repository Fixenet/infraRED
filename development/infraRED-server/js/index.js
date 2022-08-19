const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

//require infraRED as the entry point to all functionality of the server
//no logic should be written here, on the index I only handle the requests and responses
const infraRED = require('./modules/main.js');

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
    await infraRED.init();
    //TODO - client needs to be aware of this being complete
    console.log('Finished initializing nodes.');

    //set up the asset folder for the client to get frontend files, no sensitive files should go here
    app.use(express.static(path.join(__dirname, './assets/')));

    console.log('Sending index.html ...');
    res.sendFile(path.join(__dirname, './assets/index.html'), (error) => {
        if (error) console.error(error);
        res.end();
        console.log('Finished sending index.');
    });
});

app.get('/listNodes', (req, res) => {
    console.log('Requesting nodes from the loader.');
    res.status(200).send(infraRED.listNodes());
    res.end();
});

app.use(express.json()); 
app.post('/deploy', (req, res) => {
    console.log('Deployment request arrived at server.');
    infraRED.deploy(req.body.nodes);
    
    //TEST - send back to the client for reading values on browser
    res.status(200).send(req.body);
    res.end();
});

app.listen(port, () => {
    console.log(`infraRED app listening on port ${port}`);
});