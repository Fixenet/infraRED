infraRED.components = (function() {
    // information about types of components
    registry = (function() {
        let componentTypes = [];

        function addComponentType(component) {
            componentTypes.push(component.type);
        }

        return {
            addType: addComponentType,  
        };
    })();
    
    allComponentsList = (function() {
        let components = {};

        function addComponent(component) {
            registry.addType(component);
            components[component.id] = component;
        }

        function getComponentByID(id) {
            return components[id];
        }

        return {
          addComponent: addComponent,
          getComponentByID: getComponentByID,
        };
    })();

    function addComponent(component) {
        allComponentsList.addComponent(component);
        infraRED.events.emit("components:add", component);
    }

    function relationshipExists(relationship) {
        return infraRED.components.relationships.has(relationship);
    }

    function addComponentInput(component, relationship) {
        if (!relationshipExists(relationship)) infraRED.components.relationships.add(relationship);
        allComponentsList.getComponentByID(component.id).in = relationship;
    }

    function addComponentOutput(component, relationship) {
        if (!relationshipExists(relationship)) infraRED.components.relationships.add(relationship);
        allComponentsList.getComponentByID(component.id).out = relationship;
    }

    function getComponent(componentID) {
        return allComponentsList.getComponentByID(componentID);
    }

    return {
        init: function() {
            console.log("Starting the components functionality.");
            infraRED.components.relationships.init();
        },
        add: addComponent,
        get: getComponent,
        addInput: addComponentInput,
        addOutput: addComponentOutput,
    };
})();