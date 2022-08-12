infraRED.deployer = (function () {
    function deployNodes() {
        //TODO - deepcopy of my node obj list, can probably be done better
        // i can also use this to only pass up to the server the values i want (reduce clutter)
        let cleanNodeList = [];
        for (let node of infraRED.nodes.canvasList.getAll()) {
            let cleanNode = jQuery.extend(true, {}, node);

            let cleanList = [];
            for (let relationship of cleanNode.relationships) {
                let clean = jQuery.extend(true, {}, relationship);
                delete clean.lineSVG;
                delete clean.lineOffsetPlot;
                cleanList.push(clean);
            }

            cleanNode.relationships = cleanList;
            cleanNodeList.push(cleanNode);
        }

        // post the current nodes in use to server to start deployment
        $.ajax({
            method: 'POST', url: '/deploy',
            contentType: 'application/json', dataType: 'json',
            async: false,

            data: JSON.stringify({
                "nodes": cleanNodeList
            }),

            //TODO - success function places value inside the return variable
            success: function(data) {
                console.log(data);
            }
        });
    }

    return {
        init: function() {
            console.log('Starting the deployment functionality.');

            infraRED.events.on('relationships:deploy', deployNodes);
        }
    };
})();