// Create a class for the element
class Command_test extends HTMLElement {
    constructor() {
      super();  
     
        this.wrapper = document.createElement('div');
    
        this.action_container = document.createElement("div"); 
        this.accordion_collapse = document.createElement("div")
        this.word_list_input = document.createElement("input");
        this.probability_input = document.createElement("input");
        /* Divs */    
        
        this.action_container.classList.add("command-content");
        /* Create accordion */
        var accordion = document.createElement("div")
        accordion.classList.add("accordion");
        var accordion_item = document.createElement("div")
        accordion_item.classList.add("accordion-item");
        var accordion_header = document.createElement("div")
        accordion_header.classList.add("accordion-header", "command-header");
        this.accordion_collapse.classList.add("accordion-collapse");
        this.accordion_collapse.classList.add("collapse");
        var accordion_body = document.createElement("div")
        accordion_body.classList.add("accordion-body", "command-accordion-body");
        /* input groups */
        var input_group_word_list = document.createElement("div");
        input_group_word_list.classList.add("input-group",  "input-group-word-list");
        var input_group_word_list_prepend = document.createElement("div");
        input_group_word_list_prepend.classList.add("input-group-prepend");
        
        var input_group_probability = document.createElement("div");
        input_group_probability.classList.add("input-group",  "input-group-probability");
        var input_group_probability_append = document.createElement("div");
        input_group_probability_append.classList.add("input-group-append");
        var probability_unit = document.createElement("span");
        probability_unit.classList.add("input-group-text");
        probability_unit.textContent = "%";
        /* buttons */    
        /* test button */
        var test_button  = document.createElement("button");
        test_button.classList.add("btn", "btn-outline-primary", "btn-command");
        test_button.textContent = "Test";
        test_button.onclick = () => {this.test();};
        
        /* actions button */
        var actions_button = document.createElement("button");
        actions_button.classList.add("btn", "btn-secondary", "dropdown-toggle", "btn-command");
        actions_button.onclick = () => {this.toggle();};
        actions_button.textContent = "Actions";
        actions_button.type = "button";

        /* remove button */
        var remove_button = document.createElement("button");
        remove_button.classList.add("btn", "btn-danger", "btn-command");
        remove_button.onclick = () => {this.remove();};
        remove_button.textContent = "x";    

        /* add button */
        var add_button = document.createElement("button");
        add_button.classList.add("btn", "btn-secondary", "btn-command");
        add_button.onclick = () => {this.add_action();}
        add_button.textContent = "+";
        
        /* clone button */
        var clone_button = document.createElement("button");
        clone_button.classList.add("btn", "btn-secondary", "btn-command");
        clone_button.onclick = () => {this.clone();}
        clone_button.textContent = "clone";
        /* inputs */
        
        /* word list input */
        this.word_list_input.classList.add("input-command", "form-control")
        this.word_list_input.type = "text";
        this.word_list_input.placeholder = "Comma separated list of chat messages";

        /* probability input */
        this.probability_input.classList.add("input-command", "form-control", "probability-input")
        this.probability_input.type = "number";
        this.probability_input.max = "100";

        /* Attach the elements to the DOM */
        this.wrapper.appendChild(accordion);
        accordion.appendChild(accordion_item);
        accordion_item.appendChild(accordion_header); 
        accordion_header.appendChild(input_group_word_list);

        input_group_word_list.appendChild(input_group_word_list_prepend);
        input_group_word_list_prepend.appendChild(test_button);
        input_group_word_list_prepend.appendChild(actions_button);
        input_group_word_list.appendChild(this.word_list_input);

        input_group_word_list.appendChild(input_group_probability);
        input_group_probability.appendChild(this.probability_input);
        input_group_probability.appendChild(input_group_probability_append);
        input_group_probability_append.appendChild(probability_unit);
        input_group_probability.appendChild(remove_button);
        
        var hr = document.createElement("hr");
        hr.classList.add("action-hr");

        accordion_item.appendChild(this.accordion_collapse);
        this.accordion_collapse.appendChild(accordion_body);
        accordion_body.appendChild(add_button);
        accordion_body.appendChild(clone_button);
        accordion_body.appendChild(hr);
        accordion_body.appendChild(this.action_container);    
    }
    
    connectedCallback(){        
        this.appendChild(this.wrapper);
    }

    get_word_list() {
        var word_list = this.word_list_input.value.split(',').map(word => {return word.trim();});
        return this.word_list_input.value.split(',').map(word => {return word.trim();});
    }

    set_word_list(word_list) {
        this.word_list_input.value = word_list.join(", ");
    }

    get_probability() {        
        return parseInt(this.probability_input.value);
    }

    set_probability(probability) {
        this.probability_input.value = probability;
    }

    add_action(button = "A", activation = "Press", duration = "100") {
        var action = document.createElement("action-element");
        action.set_button(button);
        action.set_activation(activation);
        action.set_duration(duration);
        this.action_container.appendChild(action);
    }

    remove() {
        this.parentElement.removeChild(this)
    }

    toggle() {        
        $(this.accordion_collapse).collapse("toggle");
    }

    test() {
        var first_word = this.get_word_list()[0];
        //update();
        console.log("test")
        socket.emit('test_command', first_word);
    } 

    clone() {
        var command = document.createElement("command-element");
        command.set_word_list(this.get_word_list());
        command.set_probability(this.get_probability());

        this.action_container.childNodes.forEach(action => {
            var new_action = document.createElement("action-element");
            var button = action.get_button()[0];
            var activation = action.get_activation();
            var duration = action.get_duration();
            command.add_action(button, activation, duration);
        });
        this.after(command);
    }

    dump_json(){        
        var json;
        var action_list = []
        this.action_container.childNodes.forEach(action => {
            action_list.push(action.dump_json());
        });
        json = {
            "chat_msgs": this.get_word_list(),
            "percentage": this.get_probability(),
            "actions": action_list
        }
        return json;
    }
  }

class Action_test extends HTMLElement{
    constructor(){
        super();

        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("action");
        this.options = [
            "A", "B", "X", "Y", "DPAD_UP", "DPAD_DOWN", "DPAD_LEFT", 
            "DPAD_RIGHT", "START", "BACK", "LEFT_THUMB", "LEFT_SHOULDER", 
            "RIGHT_THUMB", "RIGHT_SHOULDER", "GUIDE"
        ]
        
        this.input_group_duration = document.createElement("div");        
        this.button = document.createElement("select");
        this.activation_button = document.createElement("button");        
        this.duration = document.createElement("input");

        /* divs */
        var activation_container = document.createElement("div");
        var for_span = document.createElement("span");
        for_span.classList.add("for-span");
        for_span.textContent = " for ";
        /* input goups */
        this.input_group_duration.classList.add("input-group",  "input-group-duration");
        var input_group_duration_append = document.createElement("div");
        input_group_duration_append.classList.add("input-group-append");
        var duration_unit = document.createElement("span");
        duration_unit.classList.add("input-group-text");
        duration_unit.textContent = "ms";

        var input_group_action = document.createElement("div");
        input_group_action.classList.add("input-group",  "input-group-action")
        /* selects */
        this.button.classList.add("action-select");
        this.button.classList.add("container-fluid", "btn-command", "form-select");
        /* select options */
        this.options.forEach(option => {
            var opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            this.button.appendChild(opt)
        });
        /* buttons */
        this.activation_button.classList.add("btn", "btn-secondary", "btn-action-activation", "btn-command", "command-action-activation");
        this.activation_button.onclick = () => {this.next_activation()};
        this.activation_button.textContent = "Press";
        var remove_button = document.createElement("button");
        remove_button.classList.add("btn", "btn-danger", "btn-command");
        remove_button.onclick = () => {this.remove(this)};
        remove_button.textContent = "x";

        /* inputs */    
        this.duration.classList.add("input-action", "form-control")
        this.duration.type = "number";
        this.duration.min = "0";
        
        this.wrapper.appendChild(input_group_action)
        input_group_action.appendChild(this.button);
        input_group_action.appendChild(this.input_group_duration);
        this.input_group_duration.appendChild(this.activation_button);
        this.input_group_duration.appendChild(for_span);
        this.input_group_duration.appendChild(this.duration)
        this.input_group_duration.appendChild(input_group_duration_append);
        input_group_duration_append.appendChild(duration_unit);
        input_group_action.appendChild(remove_button);
    }
    connectedCallback(){
        this.appendChild(this.wrapper);
        //this.wrapper.draggable = true;
    }

    set_duration(duration) {
        this.duration.value = duration;
    }

    get_duration() {
        return parseInt(this.duration.value);
    }

    set_button(button) {
        this.button.selectedIndex = this.options.findIndex((element) => element == button);
    }

    get_button() {
        var buttons = [];
        buttons.push(this.button.value)
        return buttons;
    }

    
    next_activation(){
        if(this.activation_button.textContent == "Press") {
            this.set_activation("Hold");
        }
        else if(this.activation_button.textContent == "Hold") {
            this.set_activation("Release");
        }
        else if(this.activation_button.textContent == "Release") {
            this.set_activation("Press");
        }
    }

    /* Set the activation */
    set_activation(activation){
        console.log(`Activation: ${activation}`)
        if(activation == "Press"){
            this.activation_button.classList.remove("action-activation-HOLD-RELEASE");
            this.duration.disabled = false;
        }
        else if(activation == "Hold" || activation=="Release"){
            this.activation_button.classList.add("action-activation-HOLD-RELEASE");
            this.duration.disabled = true;
        }
        else
            return;
        this.activation_button.textContent = activation;
    }

    get_activation(){
        return this.activation_button.textContent;
    }

    dump_json(){        
        var json = {
            "activation" : this.get_activation(),
            "buttons": this.get_button(),
            "duration": this.get_duration()
        }
        return json;
    }

    remove() {
        this.parentElement.removeChild(this);
    }
}


class CommandManager_test extends HTMLElement{
    constructor () {
        super();

        this.game_name = "";
        this.file_name = "";
        this.box_art_url = "";
        this.commands = [];

        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("command-manager-wrapper");
        var header = document.createElement("div");
        header.classList.add("command-manager-header");

        this.game_span = document.createElement("h1");
        this.file_span = document.createElement("h5");

        this.command_container = document.createElement("div");
        this.command_container.classList.add("command-container");

        this.add_button = document.createElement("button");
        this.add_button.classList.add("btn", "btn-primary");
        this.add_button.textContent = "Add";
        this.add_button.onclick = () => {this.add_command()};

        this.save_button = document.createElement("button");
        this.save_button.classList.add("btn", "btn-primary");
        this.save_button.textContent = "Save";
        this.save_button.onclick = () => {this.save()};

        this.save_as_button = document.createElement("button");
        this.save_as_button.classList.add("btn", "btn-primary");
        this.save_as_button.textContent = "Save as";
        this.save_as_button.onclick = () => {this.save_as()};

        this.wrapper.appendChild(header);
        header.appendChild(this.game_span);
        header.appendChild(this.file_span);
        header.appendChild(this.add_button);
        header.appendChild(this.save_button);
        header.appendChild(this.save_as_button);
        this.wrapper.appendChild(this.command_container);

        this.modal = new SaveModal();
    }

    connectedCallback(){
        this.appendChild(this.wrapper);
    }

    clear(){
        while(this.command_container.firstChild){
            this.command_container.removeChild(this.command_container.firstChild);
        }
    }

    update(){
        socket.emit('update_commands', this.dump_json());
    }

    save() {                      
        this.jsn = {
            "game": this.game_name,
            "box_art_url": this.box_art_url,
            "updated": 0,
            "commands": this.dump_commands()
        };
        socket.emit("save",this.jsn, this.file_name);
    }

    save_as() {
        //console.log(this.modal)
        this.modal.show(this.dump_commands(), this.game_name, this.file_name, this.box_art_url);
    }

    add_command(word_list=[], probability = 100, actions = []){
        // actions is a list of jsons
        var command = document.createElement("command-element");
        command.set_word_list(word_list);
        command.set_probability(probability);

        actions.forEach(action => {
            var buttons  = action.buttons[0];
            var activation = action.activation;
            var duration = action.duration;
            command.add_action(buttons, activation, duration);
        });

        this.command_container.appendChild(command);
        return command;
    }

    load_json(json, file_name){
        this.clear();
        this.game_name = json.game;
        this.game_span.textContent = this.game_name;
        this.file_name = file_name;
        this.file_span.textContent = `(${this.file_name}.json)`;
        this.box_art_url = json.box_art_url;
        this.commands = json.commands;
        this.commands.forEach(command => {
            var chat_msgs = command.chat_msgs;
            var probability = command.percentage;
            var actions = command.actions;
            this.add_command(chat_msgs, probability, actions);
        });
    }

    dump_commands(){
        var command_list = [];
        this.command_container.childNodes.forEach(command => {
            command_list.push(command.dump_json());
        }); 
        return command_list;
    }
}

class SaveModal extends Modal {
    constructor() {
        super();
        this.command_json_list = [];
        this.box_art_url = "";

        this.jsn = {};

        this.modal_dialog.classList.add("save-modal-dialog", "modal-dialog-centered");
        this.body.classList.add("save-modal-body");
        var image_container =  document.createElement("div");
        image_container.classList.add("save-modal-image-container")
        var input_container =  document.createElement("div");
        input_container.classList.add("save-modal-input-container")
        var game_input_group =  document.createElement("div");
        game_input_group.classList.add("input-group")

        var save_button = document.createElement("button");
        save_button.classList.add("btn", "btn-primary");
        save_button.textContent = "Save";
        save_button.onclick = () => {this.save()};

        this.game_input = document.createElement("input"); 
        this.game_input.classList.add("form-control");
        this.game_input.placeholder = "Twitch category";

        this.game_input.addEventListener("input", () => {
            if(this.game_input.value != "")
                this.fetch_game_image(this.game_input.value);
            else {
                this.reset_image();
            }
        });
        
        this.file_input = document.createElement("input"); 
        this.file_input.classList.add("form-control");
        this.file_input.placeholder = "file name";
        var get_category_button = document.createElement("button");
        get_category_button.classList.add("btn", "btn-primary");
        get_category_button.textContent = "Use your current category";
        get_category_button.onclick = () => {this.get_current_category()};

        
        this.image = document.createElement("div");
        this.image.classList.add("card-img-top", "load-card-placeholder");

        /* Duplicate window */
        this.duplicate_window = document.createElement("div");
        this.duplicate_window.classList.add("save-modal-duplicate-window", "modal-content", "hidden");

        var duplicate_window_span = document.createElement("span");
        duplicate_window_span.textContent = "The file already exists, do you want to overwrite it?";

        var duplicate_window_save_button = document.createElement("button");
        duplicate_window_save_button.classList.add("btn", "btn-primary");
        duplicate_window_save_button.textContent = "Save";
        duplicate_window_save_button.onclick = () => {            
            socket.emit("save",this.jsn, this.file_input.value);
            this.hide_duplicate();
        };
        
        var duplicate_window_cancel_button = document.createElement("button");
        duplicate_window_cancel_button.classList.add("btn", "btn-secondary");
        duplicate_window_cancel_button.textContent = "Cancel";
        duplicate_window_cancel_button.onclick = () => {
            this.hide_duplicate();
        };
        this.duplicate_window.appendChild(duplicate_window_span);
        this.duplicate_window.appendChild(duplicate_window_cancel_button);
        this.duplicate_window.appendChild(duplicate_window_save_button);
        

        /* Creating DOM tree */
        this.body.appendChild(image_container);
        image_container.appendChild(this.image);
        this.body.appendChild(input_container);
        input_container.appendChild(game_input_group);
        game_input_group.appendChild(this.game_input);
        game_input_group.appendChild(get_category_button);
        input_container.appendChild(this.file_input);
        this.modal_footer.appendChild(save_button);

        this.modal_content.appendChild(this.duplicate_window);
    }

    show(command_json_list, game_name = "", file_name = "", box_art_url = ""){
        this.command_json_list = command_json_list;
        this.reset_image();
        if(box_art_url == "")
            this.fetch_game_image(game_name);
        else
            this.set_game_image(box_art_url);
        this.game_input.value = game_name;
        this.file_input.value = file_name;

        super.show();
    }

    hide(){        
        this.hide_duplicate();
        super.hide();
    }

    show_duplicate() {
        this.duplicate_window.classList.remove("hidden")
    }

    hide_duplicate() {
        this.duplicate_window.classList.add("hidden")
    }

    save(){                 
        this.jsn = {
            "game": this.game_input.value,
            "box_art_url": this.box_art_url,
            "updated": 0,
            "commands": this.command_json_list
        };
        socket.emit("save_as",this.jsn, this.file_input.value);
    }

    fetch_game_image(game){
        var url = `https://api.twitch.tv/helix/games?name=${game}`;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
        xhr.setRequestHeader("Client-Id", client_id);
        
        xhr.onreadystatechange = () => {
           if (xhr.readyState === 4) {
            var response = JSON.parse(xhr.responseText);
            var data = response["data"];
            data.forEach(d => {
                this.box_art_url = d["box_art_url"].replace("-{width}x{height}", "-188x250");
                this.set_game_image(this.box_art_url);             
            });
           } else {
                this.reset_image();
           }
        };
        xhr.send(); 
    }
    
    set_game_image(url){
        this.box_art_url = url;
        this.image.style.backgroundImage = ` url("${this.box_art_url}"), url("https://static-cdn.jtvnw.net/ttv-static/404_boxart-188x250.jpg")`;                
    }

    reset_image() {        
        this.box_art_url = "https://static-cdn.jtvnw.net/ttv-static/404_boxart-188x250.jpg";
        this.set_game_image(this.box_art_url);
    }

    get_current_category(){

    }
}

// Define the new elements
customElements.define('command-element', Command_test);
customElements.define('command-manager', CommandManager_test);
customElements.define('action-element', Action_test);