var infraRED = (function() {
    function init() {
        console.log("infraRED is starting.");

        infraRED.validator.init();

        infraRED.nodes.init();
        infraRED.relationships.init();

        infraRED.nodes.create("my_server");
        infraRED.nodes.create("my_storage");

        infraRED.nodes.get("my_server").changeType("tosca.nodes.Compute");

        infraRED.nodes.addCapability(infraRED.nodes.get("my_storage"), infraRED.relationships.create("local_storage"));
        infraRED.nodes.addRequirement(infraRED.nodes.get("my_server"), infraRED.relationships.get("local_storage"));

        infraRED.nodes.addCapability(infraRED.nodes.get("my_server"), infraRED.relationships.create("host"));

        console.log(infraRED.nodes.get("my_server"));
        console.log(infraRED.nodes.get("my_storage"));

        console.log("infraRED finished booting.");
    }

    return {
        init: init,
    };
})();