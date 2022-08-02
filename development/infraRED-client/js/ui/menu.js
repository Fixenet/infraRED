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

            // talk to server to start deployment
            JSON.parse('{ "yo": "yo" }'.trim());

            $.ajax({
                method: 'POST',
                url: '/deploy',
                contentType: 'application/json',
                dataType: 'json',
                async: false,

                data: JSON.stringify({
                    "nodes": infraRED.nodes.resourceList.getAll(),
                    "relationships": infraRED.relationships.canvasList.getAll(),
                    "nice": 69,
                }),
    
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