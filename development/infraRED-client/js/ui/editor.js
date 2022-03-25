// use this file to define the base layout for the editor
$('#infraRED-ui-root').append('<div id="infraRED-ui-menu-bar">Menu</div>');
$('#infraRED-ui-root').append('<div id="infraRED-ui-category-bar">Category</div>');
$('#infraRED-ui-root').append('<div id="infraRED-ui-resource-bar">Resource</div>');

$('#infraRED-ui-root').append('<div id="infraRED-ui-canvas">Canvas</div>');
$('#infraRED-ui-canvas').droppable({
    greedy: true,
    hoverClass: "drop-hover",
    accept: ".resource-node",
    drop: function(event, ui) {
        $(this).append($(ui.helper).clone().addClass("node").removeClass("resource-node ui-draggable ui-draggable-handle ui-draggable-dragging").draggable({
            containment: "parent",
        }));
    },
});

$('#infraRED-ui-root').append('<div id="infraRED-ui-status-bar">Status</div>');