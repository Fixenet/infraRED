var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");
        infraRED.components.init();

        let component1 = {
            id: 1,
            type: "tosca.nodes.Compute"
        };

        let component2 = {
            id: 2,
            type: "tosca.nodes.Database"
        };

        let relationship1 = {
            id: 1,
            type: "tosca.relationships.HostedOn"
        };

        infraRED.components.add(component1);
        infraRED.components.add(component2);

        infraRED.components.addInput(component2, relationship1);
        infraRED.components.addOutput(component1, relationship1);

        console.log("InfraRED finished starting.");

        console.log(infraRED.components.get(1));
        console.log(infraRED.components.get(2));
    }

    return {
        init: init,
    };
})();