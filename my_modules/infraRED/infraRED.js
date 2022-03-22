var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");
        infraRED.nodes.init();

        let node1 = {
            id: 1,
            type: "tosca.nodes.Compute",
            
            properties: null,

            capabilities: null,
            requirements: null,
        };

        let node2 = {
            id: 2,
            type: "tosca.nodes.DBMS.MySQL",

            properties: null,

            capabilities: null,
            requirements: null,
        };

        let relationship1 = {
            id: 1,
            type: "tosca.relationships.HostedOn"
        };

        infraRED.events.DEBUG = false;
        infraRED.events.on("components:add", (node1) => {
            console.log("Added the component with id: " + node1.id);
        });

        infraRED.nodes.add(node1);
        infraRED.nodes.add(node2);

        infraRED.nodes.addInput(node2, relationship1);
        infraRED.nodes.addOutput(node1, relationship1);

        console.log("InfraRED finished starting.");

        console.log(infraRED.nodes.get(1));
        console.log(infraRED.nodes.get(2));
    }

    return {
        init: init,
    };
})();