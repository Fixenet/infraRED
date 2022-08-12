//use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    /**
     * Will create a button that emits an event to start a specific functionality
     * @param {string} functionalityName name of the functionality this button will perform
     * @param {function} emit the event emit function (because i want to keep my Obsidian script)
     * @returns the button DOM object
     */
    function createButton(functionalityName, emit) {
        let id = functionalityName.toLowerCase().replace(' ','-');
        let newButton = $('<button>', {
            id: `${id}-button`,
            class: 'menu-bar-button',
            text: functionalityName,
        });

        $(newButton).on('click', emit);
        return newButton;
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

            //each button gets a function that when called, calls the emit event inside
            content.append(createButton('Log Resources', () => infraRED.events.emit('nodes:log-resources')));
            content.append(createButton('Log Canvas', () => infraRED.events.emit('nodes:log-canvas')));
            content.append(createButton('Log Relationships', () => infraRED.events.emit('relationships:log-all')));
            content.append(createButton('Log Current Connection', () => infraRED.events.emit('relationships:log-current-connection')));
            content.append(createButton('Deploy', () => infraRED.events.emit('relationships:deploy')));
        },
        get: function() {
            return menuBar;
        },
    };
})();