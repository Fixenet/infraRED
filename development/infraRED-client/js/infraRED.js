var infraRED = (function() {
    return {
        init: function() {
            console.log('infraRED is starting.');
            infraRED.validator.init();

            infraRED.nodes.init();
            infraRED.relationships.init();
            infraRED.canvas.init();

            infraRED.loader.loadNodes();

            infraRED.deployer.init();
    
            console.log('infraRED finished booting.');
        },
    };
})();