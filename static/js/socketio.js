var authentication_visible = true;
var client_id;
var access_token;
var user_channel = "corbynaut"

// Connect to the Socket.IO server.
// The connection URL has the following format, relative to the current page:
//     http[s]://<domain>:<port>[/<namespace>]
  
var socket = io.connect('http://' + document.domain + ':' + location.port);

$(document).ready(function() {


    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function() {
        var data = null
        if(document.location.hash){
            var data = {
                access_token: document.location.hash.match(/access_token=(\w)*/)[0].substring(13),
                scope: document.location.hash.match(/scope=(\w)*/)[0].substring(6),
                token_type: document.location.hash.match(/token_type=(\w)*/)[0].substring(11),
            }
            console.log(data["access_token"]);
            socket.emit('access_token_event', data);
        }
        socket.emit('send_client_id');
        socket.emit('send_access_token');
        console.log("CONNECT")

        /* TODO: reset everything? */
    });

    socket.on('authenticate_response', function(msg) {        
        authentication_window.show();        
        authentication_window.show_authenticate_window(location.hostname === "localhost");
        /*
        if(authentication_visible)
            return;

        var element = authentication_window;
        element.classList.remove("slide_in");    
        element.classList.remove("slide_out"); 
        element.classList.add("slide_in");
        authentication_visible = true;
        */
    });

    socket.on('chat_message_response', function(msg) {
        var channel = msg["channel"];
        chat_container.add_message(channel, msg); 
    });

    socket.on('delete_chat_message', function(user, msg) {
        chat_container.delete_message(user, msg); 
    });

    socket.on('join_channel', function(channel) {        
        chat_container.add_chat(channel); 
    });

    socket.on('leave_channel', function(channel) {        
        chat_container.remove_chat(channel); 
    });

    socket.on('is_authenticated_response', function() {
        authentication_window.show_start_window();       
        /* 
        var element = authentication_window;
        if(authentication_visible){
            //setTimeout(function(){element.classList.add("slide_out")}, 1000);
            element.classList.add("slide_out")
            authentication_visible = false
        }
        */
    });

    socket.on('update_commands', function(game_data, file_name) {        
        var game = game_data.game;
        var commands = game_data.commands;
        command_manager.load_json(game_data, file_name)

        var someTabTriggerEl = document.querySelector('#command-window-tab')
        var tab = new bootstrap.Tab(someTabTriggerEl)      
        tab.show()
    });

    socket.on('shutdown_request', function() { 
        socket.emit('shutdown_event');
    });

    socket.on('client_id', function(c_id) { 
        client_id = c_id;
        console.log(`client_id: ${client_id}`);
    });

    socket.on('access_token', function(token) { 
        access_token = token;
        console.log(`access_token: ${access_token}`);
    });

    socket.on('alert_message', function(alert) { 
        alert_manager.add(alert["type"], alert["msg"]);
    });

    socket.on('command_file_infos', function(save_files) { 
        load_window.clear();
        for(var i = 0; i<save_files.length; i++){
            var save_file_dict = save_files[i];
            var game = save_file_dict["game"];
            var file_name = save_file_dict["file_name"];
            var box_art_url = save_file_dict["box_art_url"];
            if(box_art_url == undefined)
                box_art_url = "";
            load_window.add_card(file_name, game, box_art_url)
        }
    });

    socket.on('add_controller', function(index, regex) {   
        controller_manager.add_controller(index, regex);
    });

    /* save window */
    socket.on('save_as_window_duplicate', function() {          
        console.log("Save window duplicate");
        command_manager.modal.show_duplicate();
    });

    socket.on('hide_save_modal', function() {          
        console.log("Save window duplicate");
        command_manager.modal.hide();
    });

    socket.on('set_pause_button', function(paused) {
        console.log("set_btn") 		
        console.log(paused)
        const button = document.getElementById("pause-button");
        if(paused) {
            button.textContent = "Pause";
        }
        else {
            button.textContent = "Resume";
        }
    });
});