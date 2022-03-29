// use this file to define the resource bar

//TODO - this only gets the keys, i need a way to decompose the object of each type
for (let type in nodeTypes) {
    var node = infraRED.nodes.create(type);
    
    const capabilities = nodeTypes[type].capabilities;
    const requirements = nodeTypes[type].requirements;

    if (capabilities) node.addCapabilities(nodeTypes[type].capabilities);
    if (requirements) node.addRequirements(nodeTypes[type].requirements);

    $('#infraRED-ui-resource-bar').append(node.getDiv());

    console.log("Imported: " + type);
}

$(".resource-node").draggable({
    helper: "clone",
    start: function(event, ui) {
    }
});

