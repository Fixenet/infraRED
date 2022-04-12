// use this file to define node behaviour
infraRED.editor.relationships = (function () {
    return {
        init: function() {
            $(".resource-relationship").draggable({
                appendTo: "#infraRED-ui-root",
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,
                revert: "invalid",
                revertDuration: 300,
                create: function(event, ui) {
                    //HTML page loads with 90% width so it's responsive to the layout
                    //this then creates the draggable with static width so the width doesnt change at the moment of drag
                    
                    //TODO - this does not work now since i hide the window
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: "relationship",
                    });
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });

            infraRED.events.on("relationship:canvas-drop", (droppedRelationship, droppedElement) => {
                droppedElement.removeClass("resource-relationship");
                droppedElement.addClass("canvas-relationship");
            
                droppedElement.draggable({
                    containment: "parent",
                    stack: ".canvas-relationship",
                    scroll: false,
                    grid: [gridSizeGap, gridSizeGap],
    
                    drag: function(event, ui) {
                    },
                });
    
                let canvasRelationship = infraRED.relationships.add(droppedRelationship);
    
                droppedElement.on("dblclick", () => {
                    droppedElement.remove();
                    infraRED.relationships.remove(canvasRelationship);
                });
            });
        }
    };
})();