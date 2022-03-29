infraRED.init();

//load known nodes from a JSON file into an object variable
var nodeTypes;
$.ajax({
    url: '/nodes.json',
    dataType: 'json',
    async: false,
    success: function(data) {
        console.log("Importing node types...");
        nodeTypes = data;
    }
});
