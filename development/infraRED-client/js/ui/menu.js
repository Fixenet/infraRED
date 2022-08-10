// use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    function createLogResourcesButton() {
        let button = $('<button>', {
            id: 'log-resources-button',
            class: 'menu-bar-button',
            text: 'Log Resources Nodes',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-resources');
        });

        return button;
    }

    function createLogCanvasButton() {
        let button = $('<button>', {
            id: 'log-canvas-button',
            class: 'menu-bar-button',
            text: 'Log Canvas Nodes',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-canvas');
        });

        return button;
    }

    function createLogRelationshipsButton() {
        let button = $('<button>', {
            id: 'log-relationships-button',
            class: 'menu-bar-button',
            text: 'Log Relationships',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-relationships');
        });

        return button;
    }

    function createLogCurrentConnectionButton() {
        let button = $('<button>', {
            id: 'log-current-connection-button',
            class: 'menu-bar-button',
            text: 'Log Current Connection',
        });

        $(button).on('click', () => {
            infraRED.events.emit('canvas:log-connection-variables');
        });

        return button;
    }

    function createDeployButton() {
        let button = $('<button>', {
            id: 'deploy-button',
            class: 'menu-bar-button',
            text: 'Deploy',
        });

        $(button).on('click', () => {
            infraRED.events.emit('relationships:deploy');

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

            // talk to server to start deployment
            $.ajax({
                method: 'POST',
                url: '/deploy',
                contentType: 'application/json',
                dataType: 'json',
                async: false,

                data: JSON.stringify({"nodes": cleanNodeList}),
    
                // success function places value inside the return variable
                success: function(data) {
                    console.log(data);
                }
            });
        });

        return button;
    }

    return {
        init: function() {
            console.log('%cCreating Menu Bar...', 'color: #a6c9ff');

            menuBar = $('#infraRED-ui-menu-bar');

            let content = $('<div>', {
                id: 'menu-bar-content',
                class: 'content',
            });
            menuBar.append(content);

            content.append(createLogResourcesButton());
            content.append(createLogCanvasButton());
            content.append(createLogRelationshipsButton());
            content.append(createLogCurrentConnectionButton());
            content.append(createDeployButton());
        },
        get: function() {
            return menuBar;
        },
    };
})();