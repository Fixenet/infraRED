//'backend' for client side
infraRED.init();
infraRED.events.DEBUG = true; //prints logs
//frontend/views for client side
infraRED.editor.init();

//ask the user if they really want to leave
//in case we implement some saving functionality
//TODO - window.onbeforeunload = function() { return true; };