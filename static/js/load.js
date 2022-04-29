class LoadWindow {
    constructor(div){
        this.card_list = [];

        this.div = div;
        this.div.classList.add("load-window");
        var header_div = document.createElement("div");
        header_div.classList.add("load-window-header");

        var header = document.createElement("h1");
        header.textContent = "Load files";
        var subheader = document.createElement("h5");
        subheader.textContent = "Click on a card to load, or drag and drop a .json file to upload commands";

        var load_scroll = document.createElement("div");
        load_scroll.classList.add("load-scroll");

        this.load_container = document.createElement("div");
        this.load_container.classList.add("load-container");

        this.search_input = document.createElement("input");
        this.search_input.classList.add("form-control");
        this.search_input.placeholder = "Game title or file name";
        this.search_input.addEventListener("input", () => {
            this.clear_load_container();
            for(var i = 0; i<this.card_list.length; i++) {
                if(this.card_list[i].game.toLowerCase().includes(this.search_input.value.toLowerCase())|| this.card_list[i].file.toLowerCase().includes(this.search_input.value.toLowerCase())){
                    this.load_container.appendChild(this.card_list[i].node);
                }
            }
        });

        /* Drag and Drop */
        this.drag_drop_window = document.createElement("div");
        this.drag_drop_window.classList.add("load-drag-drop-window");
        var drag_drop_inner = document.createElement("div");
        drag_drop_inner.classList.add("load-drag-drop-inner");

        /* initial state */
        this.drag_drop_initial = document.createElement("div");
        this.drag_drop_initial.classList.add("drag-drop-initial");
        var drag_drop_initial_span = document.createElement("div");
        drag_drop_initial_span.classList.add("load-drag-drop-span", "load-drag-drop-initial-span");
        drag_drop_initial_span.textContent = "Drag and drop .json files here";
        this.drag_drop_initial.appendChild(drag_drop_initial_span);

        /* uploading state */
        this.drag_drop_uploading = document.createElement("div");
        this.drag_drop_uploading.classList.add("drag-drop-uploading");
        var drag_drop_uploading_span = document.createElement("div");
        drag_drop_uploading_span.classList.add("load-drag-drop-span", "load-drag-drop-uploading-span");
        drag_drop_uploading_span.textContent = "Uploading...";
        this.drag_drop_uploading.appendChild(drag_drop_uploading_span);

        /* success state */
        this.drag_drop_success = document.createElement("div");
        this.drag_drop_success.classList.add("drag-drop-success");
        var drag_drop_success_span = document.createElement("div");
        drag_drop_success_span.classList.add("load-drag-drop-span", "load-drag-drop-success-span");
        drag_drop_success_span.textContent = "Success";
        this.drag_drop_success.appendChild(drag_drop_success_span);

        /* error state */
        this.drag_drop_error = document.createElement("div");
        this.drag_drop_error.classList.add("drag-drop-error");
        var drag_drop_error_span = document.createElement("div");
        drag_drop_error_span.classList.add("load-drag-drop-span", "load-drag-drop-error-span");
        drag_drop_error_span.textContent = "Error";
        this.drag_drop_error.appendChild(drag_drop_error_span);

        this.drag_drop_window.appendChild(drag_drop_inner);
        drag_drop_inner.appendChild(this.drag_drop_initial);
        drag_drop_inner.appendChild(this.drag_drop_uploading);
        drag_drop_inner.appendChild(this.drag_drop_success);
        drag_drop_inner.appendChild(this.drag_drop_error);

        
        $(this.drag_drop_window).on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
          })
          .on('dragover dragenter', () => {
            //console.log("DRAG");
            //this.drag_drop_window.classList.add('load-drag-drop-window-dragover');
            this.drag_drop_window.classList.add('load-drag-drop-window-dragover');
            this.drag_drop_initial.classList.add("display-block");
            this.drag_drop_uploading.classList.remove("display-block");
            this.drag_drop_success.classList.remove("display-block");
            this.drag_drop_error.classList.remove("display-block");
          })
          .on('dragleave dragend drop', () => {
            this.drag_drop_window.classList.remove('load-drag-drop-window-dragover');
          })
          .on('drop', (e) => {
            this.drag_drop_window.classList.add('load-drag-drop-window-dragover');
            this.drag_drop_initial.classList.remove("display-block");
            this.drag_drop_uploading.classList.add("display-block");
            this.drag_drop_success.classList.remove("display-block");
            this.drag_drop_error.classList.remove("display-block");
            
            var droppedFiles = e.originalEvent.dataTransfer.files;
            console.log(droppedFiles);

            this.count = 0;
            /*
            [...droppedFiles].forEach(file => {   
                var reader = new FileReader();             
                reader.onloadend = function(f, e) {
                    this.count++;
                    console.count(this.count);
                    console.log(f.name);
                    var jsn = JSON.parse(e.target.result);
                    //This will overwrite already existing files
                    socket.emit("save", jsn, f.name);
                }.bind(this, file);           
                reader.readAsText(file);
            });
            */

            //TODO
            const upload_files = async () => {
                console.log("test");
                const filePromises = [...droppedFiles].map((file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = async function(f, e) {
                            try {                                
                                var extension = f.name.split('.').pop();
                                if(extension != "json")
                                    return;
                                var jsn = JSON.parse(e.target.result);
                                //This will overwrite already existing files
                                socket.emit("save", jsn, f.name.slice(0, -5));
                                resolve();
                            } 
                            catch (err) {
                                reject(err);
                            }
                        }.bind(this, file);
                        reader.onerror = (error) => {
                            reject(error);
                        };
                        reader.readAsText(file);
                    });
                });
                //Wait for the completion of all promises
                const fileInfos = await Promise.all(filePromises);                
                console.log("FINISH"); 
                
                this.drag_drop_initial.classList.remove("display-block");
                this.drag_drop_uploading.classList.remove("display-block");
                this.drag_drop_success.classList.add("display-block");
                this.drag_drop_error.classList.remove("display-block");

                setTimeout(()=>{this.drag_drop_window.classList.remove('load-drag-drop-window-dragover'); this.get_files();}, 1000);
            };
            upload_files();
            //TODO
            //setTimeout(()=>{this.drag_drop_window.classList.remove('load-drag-drop-window-dragover'); this.get_files();}, 1000);
          });

          $(this.load_container).on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
          })
          .on('dragover dragenter', () => {
            this.drag_drop_window.classList.add('load-drag-drop-window-dragover');
          });


        this.div.appendChild(header_div);
        header_div.appendChild(header);
        header_div.appendChild(subheader);
        header_div.appendChild(this.search_input);
        this.div.appendChild(this.drag_drop_window);
        this.div.appendChild(load_scroll);
        load_scroll.appendChild(this.load_container);
    }

    clear_load_container(){              
        while(this.load_container.getElementsByClassName("load-card")[0]){
            this.load_container.removeChild(this.load_container.getElementsByClassName("load-card")[0]);
        }
    }

    clear() {  
        this.clear_load_container();
        this.card_list = [];
        this.search_input.value = "";
    }

    add_card(file_name, game, box_art_url = ""){
        var card = new LoadCard(file_name, game, box_art_url);
        this.load_container.appendChild(card.node);
        this.card_list.push(card);
    }

    get_files(){
        socket.emit('command_file_infos_request');        
    }

    show(){
        this.clear();
        this.get_files();
    }

    hide(){
        
    }
}

class LoadCard {
    constructor(file, game, box_art_url = ""){
        this.file = file;
        this.game = game;        
        this.box_art_url = box_art_url;

        this.node = document.createElement("div");
        this.node.classList.add("card", "load-card");
        this.node.onclick = () => {this.onclick()};
        this.body = document.createElement("div");
        this.body.classList.add("card-body");
        this.game_heading = document.createElement("h5");
        this.game_heading.textContent = this.game;
        this.body.classList.add("card-title");
        this.file_name_span = document.createElement("p");
        this.file_name_span.textContent = `${this.file}.json`;
        this.file_name_span.style.fontSize = "0.8rem";
        this.body.classList.add("card-text");

        
        this.image = document.createElement("div");
        this.image.classList.add("card-img-top", "load-card-placeholder");
        if(this.box_art_url == "") {
            console.log("no url given");
            this.fetch_game_image(this.game);
        }
        else {
            this.set_game_image(box_art_url);
        }        

        this.node.appendChild(this.image);
        this.node.appendChild(this.body);
        this.body.appendChild(this.game_heading);
        this.body.appendChild(this.file_name_span);
    }

    fetch_game_image(game, set_image = true){
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
                if(set_image)
                    this.set_game_image(this.box_art_url);             
            });
           }};
        xhr.send();             
    }

    set_game_image(url){
        this.box_art_url = url;
        this.image.style.backgroundImage = ` url("${this.box_art_url}"), url("https://static-cdn.jtvnw.net/ttv-static/404_boxart-188x250.jpg")`;                
    }

    set_file(file){
        this.file = file;
        this.file_name_span.textContent = this.file;
    }

    get_file(){
        return this.file;
    }

    set_game(game){
        this.game = game;
        this.game_heading.textContent = this.game;
        this.get_game_info(game);
    }

    get_game(){
        return this.game;
    }

    onclick(){
        socket.emit('load_commands', this.file);
    }
}