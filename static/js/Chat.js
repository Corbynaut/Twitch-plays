function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class ColorPicker{
    constructor(div){
        this.div = div;

    }
}

function list_channels(partial_channel_name, callback_fn, number = 5){
    var response;
    var url = `https://api.twitch.tv/helix/search/channels?query=${partial_channel_name}&first=${number}`;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
    xhr.setRequestHeader("Client-Id", `${client_id}`);
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        callback_fn(xhr.status, xhr.responseText);
    }};
    xhr.send();
}

class ChatContainer{
    constructor (div) {
        this.chats = {};
        this.curr_chat_index = 0;
        //number of chats including the global chat
        this.n_chats = 0;
        const this_container = this;
        
        this.div = div;
        this.div.classList.add("chat-wrapper", "container-fluid", "col-auto");
        /* divs */
        var chat_flex_wrapper = document.createElement("div");
        chat_flex_wrapper.classList.add("chat-flex-wrapper")
        var header = document.createElement("div");
        header.classList.add("chat-header");
        /* buttons */
        var hide_button = document.createElement("button");
        hide_button.classList.add("collapse-button", "bi", "bi-arrow-bar-right");
        hide_button.onclick = function() {this_container.hide();};

        this.join_button = document.createElement("button");
        this.join_button.classList.add("btn", "btn-primary");
        this.join_button.textContent="Join";
        this.join_button.onclick = function() {this_container.show_join_window()};

        this.leave_button = document.createElement("button");
        this.leave_button.classList.add("btn", "btn-danger");
        this.leave_button.textContent="Leave";
        this.leave_button.onclick = function() {
            var index = this_container.curr_chat_index;
            /* Check if the current chat is not the global chat */
            if(index == 0)
                return;
            socket.emit('leave_channel_request', Object.keys(this_container.chats)[index-1]);
        };
        this.leave_button.style.display = "none"
        /* header carousel */
        this.header_carousel = document.createElement("div");
        this.header_carousel.classList.add("carousel", "header-carousel");
        this.header_carousel_items = document.createElement("div");
        this.header_carousel_items.classList.add("carousle-inner");
        var header_carousel_button_prev = document.createElement("button");
        header_carousel_button_prev.classList.add("carousel-control-prev");
        header_carousel_button_prev.onclick = function() {this_container.prev_chat()};
        header_carousel_button_prev.role = "button";
        var header_carousel_button_prev_span = document.createElement("span");
        header_carousel_button_prev_span.classList.add("carousel-control-prev-icon");
        header_carousel_button_prev.appendChild(header_carousel_button_prev_span);
        
        var header_carousel_button_next = document.createElement("button");
        header_carousel_button_next.classList.add("carousel-control-next");
        header_carousel_button_next.onclick = function() {this_container.next_chat()};
        header_carousel_button_next.role = "button";
        var header_carousel_button_next_span = document.createElement("span");
        header_carousel_button_next_span.classList.add("carousel-control-next-icon");
        header_carousel_button_next.appendChild(header_carousel_button_next_span);

        /* chat carousel*/
        this.chat_carousel = document.createElement("div");
        this.chat_carousel.classList.add("carousel", "container-fluid", "chat-carousel");
        this.chat_carousel_items = document.createElement("div");
        this.chat_carousel_items.classList.add("carousle-inner", "chat-body-carousel-inner");


        this.div.appendChild(chat_flex_wrapper);
        chat_flex_wrapper.appendChild(header);
        header.appendChild(hide_button);
        header.appendChild(this.header_carousel);
        this.header_carousel.appendChild(header_carousel_button_prev);
        this.header_carousel.appendChild(this.header_carousel_items);
        this.header_carousel.appendChild(header_carousel_button_next);
        header.appendChild(this.join_button);
        header.appendChild(this.leave_button);
        chat_flex_wrapper.appendChild(this.chat_carousel);
        this.chat_carousel.appendChild(this.chat_carousel_items);

        //Stop autoplay
        var h_carousal = new bootstrap.Carousel(this.header_carousel, {
            interval: 0,
            pause: true
          })
        var c_carousal = new bootstrap.Carousel(this.chat_carousel, {
            interval: 0,
            pause: true
          })
        
        /* Binding the bootstrap carousel slid event to curr_chat_index  */
        $(this.chat_carousel).bind('slid.bs.carousel', function() {
            this_container.curr_chat_index = $(this_container.header_carousel_items).find('.active').index();
            if(this_container.curr_chat_index == 0)
                this_container.leave_button.style.display = "none"
            else            
                this_container.leave_button.style.display = "inline"
        });

        /* Adding global chat that contains the messages of every joined channel */
        this.global_chat = new GlobalChat(this);
        this.global_chat.node.classList.add("active");
        var item = document.createElement("div");
        item.classList.add("carousel-item","active", "chat-header-carousel-item");
        item.textContent = `All\r\nSTREAM CHATS`;
        this.header_carousel_items.appendChild(item);
        this.chat_carousel_items.appendChild(this.global_chat.node);

        /* JoinWindow */
        this.join_window = new JoinWindow(this);
        this.div.appendChild(this.join_window.node);
    }

    add_chat(channel){        
        //Check if channel is in this.chats
        channel = channel.toLowerCase();
        if (channel in this.chats)
        {
            //TODO send error message
            return;
        }
        if(Object.keys(this.chats).length == 0){
            this.global_chat.clear();
        }

        const chat = new Chat(this, channel);
        this.chats[channel] = chat;
        var item = document.createElement("div");
        item.classList.add("carousel-item", "chat-header-carousel-item");
        item.textContent = `${channel}'s \r\n STREAM CHAT`;
        this.header_carousel_items.appendChild(item);
        this.chat_carousel_items.appendChild(chat.node);
        this.n_chats = $(this.chat_carousel_items).find('.carousel-item').length;
    }

    remove_chat(channel){
        channel = channel.toLowerCase();
        //Check if channel is in this.chats
        if (channel in this.chats)
        {            
            var channels = Object.keys(this.chats);
            for(var i = 0; i<channels.length;i++){
                if(channel == channels[i]) { 
                    $(this.header_carousel).carousel(0);   
                    $(this.chat_carousel).carousel(0);   
                    delete this.chats[channel]
                    this.header_carousel_items.children[i+1].remove();
                    this.chat_carousel_items.children[i+1].remove();
                    break;
                }
            }
            //Only the global_chat remains
            if(Object.keys(this.chats).length == 0){
                this.global_chat.no_channels_joined();
            }
            this.n_chats = $(this.chat_carousel_items).find('.carousel-item').length;
        }
    }

    next_chat(){
        $(this.header_carousel).carousel("next");
        $(this.chat_carousel).carousel("next");
    }

    prev_chat(){
        $(this.header_carousel).carousel("prev");
        $(this.chat_carousel).carousel("prev");
    }

    add_message(channel, msg){
        channel = channel.toLowerCase();
        if (channel in this.chats)
        {  
            var message_manager = new MessageManager(msg);
            //Add to channel chat
            this.chats[channel].add_message(message_manager.create_element(channel));
            //Add to global chat
            this.global_chat.add_message(message_manager.create_element(channel));
        }
    }

    delete_message(user, msg){
        console.log("delete message");
        user = user;
        var channels = Object.keys(this.chats);
        channels.forEach(channel => {
            this.chats[channel].get_messages().forEach(message => {
                console.log(user);
                console.log(message.get_user());
                console.log(message.get_user() == user)
                console.log(message.get_msg() == msg);
                if(message.get_user().toLowerCase() == user && message.get_msg() == msg){
                    message.set_msg("<deleted>");
                }
            });
        });
    }

    show_error(){
        //TODO
    }

    hide(){
        this.div.classList.add("chat-collapsed")
    }

    show(){
        this.div.classList.remove("chat-collapsed")
    }

    show_join_window(){
        this.join_window.show();
    }
}


class Chat{
    constructor(chat_container, channel){
        const this_chat = this;
        this.channel = channel;
        this.chat_container = chat_container;
        this.max_messages = 100;
        this.color = getRandomColor();

        var styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`.chat-${this.channel}-message-user {color:${this.color}}`, 0);

        this.node = document.createElement("div");
        this.node.classList.add("carousel-item", "chat-body-carousel-item");
        this.message_container = document.createElement("div");
        this.message_container.classList.add("chat","col", "container-fluid");
        this.node.appendChild(this.message_container);
    }

    add_message(element){
        if(this.message_container.children.length > this.max_messages) {
            while(0<(this.message_container.children.length - this.max_messages))
            this.message_container.removeChild(this.message_container.lastElementChild);
        } 
        this.message_container.prepend(element);
    }

    get_messages(){
        return this.message_container.childNodes;
    }
}

class GlobalChat extends Chat{
    constructor(chat_container){
        super(chat_container);
        const this_chat = this;
        
        this.join_container = document.createElement("div");
        this.join_container.classList.add("global-chat-join-window");
        var text_1 = document.createElement("h3");
        text_1.textContent = "You haven't joined a channel yet, why don't you try to";
        var your_channel_button = document.createElement("button");
        your_channel_button.classList.add("btn", "btn-primary");
        your_channel_button.textContent="join your own channel";
        your_channel_button.onclick = function() {socket.emit('join_channel_request', user_channel);};
        var text_2 = document.createElement("h3");
        text_2.textContent = "or";
        var join_button = document.createElement("button");
        join_button.classList.add("btn", "btn-primary");
        join_button.textContent="join another channel";
        join_button.onclick = function() {this_chat.chat_container.show_join_window()};
        
        this.join_container.appendChild(text_1);
        this.join_container.appendChild(your_channel_button);
        this.join_container.appendChild(text_2);
        this.join_container.appendChild(join_button);

        this.no_channels_joined();
    }

    no_channels_joined(){
        this.clear();
        this.message_container.appendChild(this.join_container);
    }

    clear(){
        while(this.message_container.firstChild){
            this.message_container.removeChild(this.message_container.firstChild);
        }
    }
}

class MessageManager {
    /*
    *   Broadcasts the changes made to the message in one channel to the other
    *   Might be useful if messages get deleted, i.e., the message content changes to "deleted" or something
    */
    constructor(msg_dict) {        
        this.msg = msg_dict["msg"];
        this.user = msg_dict["user"];
        this.elements = [];
    }

    set_user(user){
        this.elements.forEach(element => {
            element.user_span.textContent = `${user}: `;
        });
        this.user = user;
    }

    get_user(){
        return this.user;
    }

    set_msg(msg){
        this.elements.forEach(element => {
            element.msg_span.textContent = msg;
        });
        this.msg = msg;
    }

    broadcast_msg(){
        this.set_msg(this.msg)
    }

    broadcast_user(){
        this.set_user(this.user)
    }

    get_msg(){
        return this.msg;
    }

    create_element(channel){
        /*
        var chat_message = new ChatMessage(this, this.user, this.msg, channel);
        */
        var chat_message = document.createElement("chat-message");
        chat_message.set_manager(this);
        chat_message.set_channel(channel);
        this.elements.push(chat_message)
        this.broadcast_msg();
        this.broadcast_user();
        return chat_message;
    }
}

class ChatMessage extends HTMLElement{
    constructor(manager, user, msg, channel) {
        super();

        this.manager = manager;
        this.channel = null;
        this.node = document.createElement("div");     
        this.user_span = document.createElement("span");
        this.user_span.textContent = `${user}: `;
        this.msg_span = document.createElement("span");
        this.msg_span.textContent = msg;
        this.node.classList.add("chat-message");
        this.node.appendChild(this.user_span);
        this.node.appendChild(this.msg_span);

        //this.node.onclick = () => {this.set_msg("Test")};
    }

    connectedCallback(){        
        this.appendChild(this.node);
    }

    set_manager(manager){
        this.manager = manager;
    }
    
    set_channel(channel){
        this.user_span.classList.remove(`chat-${this.channel}-message-user`);
        this.user_span.classList.add(`chat-${channel}-message-user`);
        this.channel = channel;
    }

    get_channel(){
        return this.channel;
    }

    set_user(user){
        this.manager.set_user(user);
    }

    get_user(){
        return this.manager.get_user();
    }

    set_msg(msg){
        this.manager.set_msg(msg);
    }

    get_msg(){
        return this.manager.get_msg();
    }
}

class JoinWindow{
    constructor(chat_container){
        this.chat_container = chat_container;
        this.node = document.createElement("div");
        this.node.classList.add("join-window", "join-window-collapsed");

        /* headers and spans */
        var header = document.createElement("h3");
        header.textContent = "Join a channel";

        /* input groups */
        var input_group_autocomplete = document.createElement("div");
        input_group_autocomplete.classList.add("input-group", "mb-3");
        var input_group_autocomplete_append = document.createElement("div");
        input_group_autocomplete_append.classList.add("input-group-append");

        /* inputs */
        this.search_input = document.createElement("input");
        this.search_input.classList.add("form-control");
        this.search_input.placeholder = "Channel name";
        this.autocomplete_menu = document.createElement("div");
        
        /* buttons */
        var cancel_button = document.createElement("button");
        cancel_button.classList.add("btn", "join-window-close-btn");
        cancel_button.textContent = "X";
        cancel_button.onclick = () => {this.hide()};
        
        var join_button = document.createElement("button");
        join_button.classList.add("btn", "btn-primary");
        join_button.textContent = "Join";
        join_button.onclick = () => {this.join_channel(this.search_input.value)};


        this.node.appendChild(cancel_button);
        this.node.appendChild(header);
        this.node.appendChild(input_group_autocomplete);
        input_group_autocomplete.appendChild(this.search_input);
        input_group_autocomplete.appendChild(input_group_autocomplete_append);
        input_group_autocomplete_append.appendChild(join_button);
        this.node.appendChild(this.autocomplete_menu);

        this.search_input.addEventListener("input", () => {
            this.clear_autocomplete();
            if(this.search_input.value != "")
                this.channel_lookup_request();
        });
    }
    
    channel_lookup_response(status, responseText){   
        this.clear_autocomplete();
        if(status != 200)
            return;
        
        var response = JSON.parse(responseText);
        var data = response["data"];
        data.forEach(c => {
            var display_name = c["display_name"];
            var thumbnail_url = c["thumbnail_url"];
            var b_live = c["is_live"];
            this.add_item(display_name, thumbnail_url, b_live);
        });
    }

    channel_lookup_request(number=10){
        var partial_channel_name = this.search_input.value;
        var url = `https://api.twitch.tv/helix/search/channels?query=${partial_channel_name}&first=${number}`;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
        xhr.setRequestHeader("Client-Id", `${client_id}`);
        xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            this.channel_lookup_response(xhr.status, xhr.responseText);
        }};
        xhr.send();
    }

    add_item(display_name, thumbnail_url, b_live=false){
        if(this.search_input.value == "")
            return;
        if(display_name.toLowerCase() in this.chat_container.chats)
            return;
        var item = new AutocompleteChannelItem(this, display_name, thumbnail_url, b_live);
        this.autocomplete_menu.appendChild(item.node);
    }

    clear(){
        this.clear_autocomplete();
        this.search_input.value = "";
    }

    clear_autocomplete(){
        while(this.autocomplete_menu.firstChild){
            this.autocomplete_menu.removeChild(this.autocomplete_menu.firstChild);
        }
    }

    join_channel(channel){
        if(channel == "") 
            return;
        this.clear();
        socket.emit("join_channel_request", channel)
    }

    show(){
        this.clear();
        this.node.classList.remove("join-window-collapsed")
    }

    hide(){
        this.node.classList.add("join-window-collapsed")
    }
}  

class AutocompleteChannelItem{
    constructor(join_window, display_name, image_url, b_live = false){
        this.join_window = join_window;
        this.display_name = display_name;
        this.image_url = image_url;
        this.b_live = b_live;
        
        this.node = document.createElement("div");
        this.node.classList.add("autocomplete-channel-item")
        this.node.onclick = () => {this.onclick();};
        var image = document.createElement("img");
        image.classList.add("autocomplete-channel-item-image");
        image.src = image_url;
        var channel = document.createElement("span");
        channel.classList.add("autocomplete-channel-item-displayname");
        channel.textContent = display_name;
        var live_dot = document.createElement("i");
        live_dot.classList.add("bi", "bi-dot", "autocomplete-channel-item-live");
        if(!b_live)
            live_dot.style.visibility = "hidden";

        this.node.appendChild(image);
        this.node.appendChild(channel);
        this.node.appendChild(live_dot);
    }

    onclick(){
        this.join_window.join_channel(this.display_name);
    }
}

customElements.define('chat-message', ChatMessage);