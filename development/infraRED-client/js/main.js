//'backend' for client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();

//ask the user if they really want to leave
//in case we implement some saving functionality
window.onbeforeunload = function() { return true; };