var infraRED = (function() {
    function init() {
        console.log("infraRED is starting.");

        infraRED.validator.init();

        infraRED.nodes.init();
        infraRED.relationships.init();

        console.log("infraRED finished booting.");
    }

    return {
        init: init,
    };
})();