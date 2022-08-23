infraRED.deployer = (function () {
    function cleanUpCanvasList() {
        //TODO - deepcopy of my node obj list, can probably be done better
        //i can also use this to only pass up to the server the values i want (reduce clutter)
        let cleanNodeList = [];
        for (let node of infraRED.nodes.canvasList.getAll()) {
            let cleanNode = $.extend(true, {}, node);
        
            for (let relationship of cleanNode.relationships) {
                delete relationship.lineSVG;
                delete relationship.lineOffsetPlot;
            }

            cleanNodeList.push(cleanNode);
        }
        return cleanNodeList;
    }

    function deployNodes() {
        //post the current nodes in use to server to start deployment
        $.ajax({
            method: 'POST', url: '/deploy',
            contentType: 'application/json', dataType: 'json',
            async: false,

            data: JSON.stringify({
                "nodes": cleanUpCanvasList()
            }),

            //TEST - we get the data back from the server
            success: function(data) {
                console.log(data);
            }
        });
    }

    function saveNodes(name) {
        //post the current nodes in use to server to start deployment
        $.ajax({
            method: 'POST', url: '/save',
            contentType: 'application/json', dataType: 'json',
            async: false,

            data: JSON.stringify({
                "name": name,
                "nodes": cleanUpCanvasList()
            }),

            //TEST - we get the data back from the server
            success: function(data) {
                console.log(data);
            }
        });
    }

    return {
        init: function() {
            console.log('Starting the deployment functionality.');

            infraRED.events.on('relationships:deploy', deployNodes);
            infraRED.events.on('relationships:save', saveNodes);
        }
    };
})();