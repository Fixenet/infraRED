var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");

        infraRED.nodes.init();
        infraRED.relationships.init();

        infraRED.nodes.create("my_server");
        infraRED.nodes.create("my_storage");

        infraRED.nodes.addCapability(infraRED.nodes.get(2), infraRED.relationships.create("local_storage"));
        infraRED.nodes.addRequirement(infraRED.nodes.get(1), infraRED.relationships.get("local_storage"));

        infraRED.nodes.addCapability(infraRED.nodes.get(1), infraRED.relationships.create("host"));

        console.log("InfraRED finished booting.");
    }

    return {
        init: init,
    };
})();