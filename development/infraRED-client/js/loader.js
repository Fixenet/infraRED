infraRED.loader = (function() {
    function importNodesFromJSLibrary() {
        console.log("Don't break charm.");

        let types;
        //TODO get node list from server
        $.ajax({
            url: "/listNodes",
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                types = data;
                console.log("Found nodes.");
            }
        });

        //TODO download all the corresponding scripts
        console.log(types);

        //TODO go into the API${types[0]} and when i get this i send the files
        /*$.getScript(`/nodes/tester.js`, function() {

            let test = new Tester();

            console.log(test.capabilties);
        });*/
    }

    return {
        testImport: importNodesFromJSLibrary,
    };
})();