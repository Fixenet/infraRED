// use this file to define the resource bar

//TODO - this only gets the keys, i need a way to decompose the object of each type
for (let type in nodeTypes) {
    let node = infraRED.nodes.create(type);

    $('#infraRED-ui-resource-bar').append(`<div class="node resource-node" id=${node.type}>
                                            <p class="type">${node.type}</p>
                                            <p>-----------------------------------------------</p>
                                            <p class="requirements">${node.requirements.length ? node.requirements : "No Requirements"}</p>
                                            <p>-----------------------------------------------</p>
                                            <p class="capabilities">${node.capabilities.length ? node.capabilities : "No Capabilities"}</p>
                                            </div>`);

    console.log("Imported: " + type);
}

$(".resource-node").draggable({
    helper: "clone",
    start: function(event, ui) {
    }
});

