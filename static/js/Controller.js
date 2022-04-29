class ControllerManager{
    constructor(div){
        this.controllers = []
        this.div = div;
        this.div.classList.add("controller-manager");

        /*Header */
        var header = document.createElement("h1");
        header.textContent = "Players";
        var description = document.createElement("p");
        description.textContent = `Create virtual controllers that the chats use to interact with your PC. \r\n        
                                   With the use of regular expressions you can assign users to a controller`;

        /* divs */
        this.controller_container = document.createElement("div");
        this.controller_container.classList.add("controller-container");
        var header_div = document.createElement("div");
        header_div.classList.add("controller-header-div");

        /* buttons */
        this.add_controller_button = document.createElement("button");
        this.add_controller_button.classList.add("btn", "btn-primary");
        this.add_controller_button.textContent = "Add Controller";
        this.add_controller_button.onclick = ()=>{
			socket.emit('add_controller');
        };

        this.update_button = document.createElement("button");
        this.update_button.classList.add("btn", "btn-primary");
        this.update_button.textContent = "Update";
        this.update_button.onclick = ()=>{
            this.controller_container.childNodes.forEach( player =>{
                socket.emit('update_partition', player.get_controller_index(), player.get_partition());
            });
        };
        
        /* Markup */
        this.div.appendChild(header_div);
        header_div.appendChild(header);
        header_div.appendChild(description);
        header_div.appendChild(this.add_controller_button);
        header_div.appendChild(this.update_button);
        this.div.appendChild(this.controller_container);
    }

    add_controller(controller_index, regex){
        //var controller = new Controller(this, controller_index);
        //this.controller_container.appendChild(controller.node);
        var player_card = document.createElement("player-card");
        player_card.set_controller_index(controller_index);
        player_card.set_partition(regex)
        this.controller_container.appendChild(player_card);
    }

    remove_controller(controller_index){

    }

    clear(){

    }
}

class PlayerCard extends HTMLElement{
    constructor() {
        super()    
        this.body = document.createElement("div");
        this.body.classList.add("player-card-body");

        /* 
        ----------------------------------------------------------------------
        Controller
        ----------------------------------------------------------------------
         */
        this.controller_wrapper = document.createElement("div");        
        this.controller_wrapper.classList.add("controller-card");
        /* Controller svgs */
        this.controller = document.createElement("div");
        this.controller.classList.add("controller-body");
        
        /* spans */
        this.controller_index_span = document.createElement("span");
        this.controller_index_span.classList.add("controller-index-span");
        this.controller_index_span.textContent = this.controller_index

        /* Markup */
        this.controller_wrapper.appendChild(this.controller_index_span);
        this.controller_wrapper.appendChild(this.controller);

        /* 
        ----------------------------------------------------------------------
        Partition
        ----------------------------------------------------------------------
        */

        this.partition = document.createElement("div");       
        this.partition.classList.add("partition");
        this.partition_wrapper = document.createElement("div");         
        this.partition_wrapper.classList.add("partition-wrapper");     
        this.regex_wrapper = document.createElement("div");        
        this.regex_wrapper.classList.add("regex-wrapper"); 
        this.regex_help_wrapper = document.createElement("div");
        this.regex_help_wrapper.classList.add("regex-help-wrapper");
        /* spans */
        var partition_header_span = document.createElement("span");
        partition_header_span.textContent = "Regex";
        var regex_help = document.createElement("p");
        regex_help.textContent = "helpful regex stuff \r\n You do not need to consider upper case in the regular expressions"

        /* input */
        this.regex_input = document.createElement("input");
        this.regex_input.classList.add("form-control");
        this.regex_input.placeholder = "Regular expression";

        /* button */
        var regex_help_button = document.createElement("button");
        regex_help_button.classList.add("btn", "bi", "bi-info-circle", "regex-help-btn");
        regex_help_button.onclick = () => {      
            if(this.regex_help_wrapper.classList.contains("display-block")) {      
                this.classList.remove("player-card-fullscreen");
                this.regex_help_wrapper.classList.remove("display-block");
            } 
            else {      
                this.classList.add("player-card-fullscreen");
                this.regex_help_wrapper.classList.add("display-block");
            }
        };

        /* Markup */
        this.partition.appendChild(this.partition_wrapper);
        this.partition_wrapper.appendChild(this.regex_wrapper);
        this.regex_wrapper.appendChild(regex_help_button);
        this.regex_wrapper.appendChild(partition_header_span);
        this.regex_wrapper.appendChild(this.regex_input);
        this.partition_wrapper.appendChild(this.regex_help_wrapper);
        this.regex_help_wrapper.appendChild(regex_help);


        this.show_partition_button = document.createElement("button");
        this.show_partition_button.classList.add("btn", "btn-primary", "show-partition-btn");
        this.show_partition_button.textContent = "show";
        this.show_partition_button.onclick = () => {
            if(this.partition.classList.contains("display-block")){
                this.hide_partitions();
            }
            else {
                this.show_partitions();
            }
        };
    }

    connectedCallback(){        
        this.appendChild(this.show_partition_button);
        this.appendChild(this.body);
        this.body.appendChild(this.controller_wrapper);
        this.body.appendChild(this.partition);
    }

    set_controller_index(controller_index){
        this.controller_index_span.textContent = controller_index;
    }

    get_controller_index() {
        return this.controller_index_span.textContent;
    }

    show_partitions() {
        this.partition.classList.add("display-block");
        this.show_partition_button.textContent = "Hide";
    }

    hide_partitions() {
        this.classList.remove("player-card-fullscreen");
        this.partition.classList.remove("display-block");        
        this.regex_help_wrapper.classList.remove("display-block");
        this.show_partition_button.textContent = "Show";
    }

    reset_partitions() {
        
    }

    set_partition(regex) {
        this.regex_input.value = regex;
    }

    get_partition() {
        return this.regex_input.value;
    }
}

class Controller extends HTMLElement{
    constructor(){
        super();

        
        var controller_wrapper = document.createElement("div");        
        controller_wrapper.classList.add("controller-card");
        /* Controller svgs */
        this.controller = document.createElement("div");
        this.controller.classList.add("controller-body");
        
        /* spans */
        this.controller_index_span = document.createElement("span");
        this.controller_index_span.classList.add("controller-index-span");
        this.controller_index_span.textContent = this.controller_index

        /* Markup */
        controller_wrapper.appendChild(this.controller_index_span);
        controller_wrapper.appendChild(this.controller);
    }

    connectedCallback(){        
        this.appendChild(this.controller_index_span);
        this.appendChild(this.controller);
        this.classList.add("controller-card");
    }

    set_controller_index(controller_index){
        this.controller_index_span.textContent = controller_index;
    }

    get_controller_index(){
        return this.controller_index_span.textContent;
    }
}

class Partition extends HTMLElement {
    constructor() {
        super();

        this.partition_wrapper = document.createElement("div");       
        this.partition_wrapper.classList.add("partition");
        /* spans */
        var header_span = document.createElement("span");
        header_span.textContent = "You do not need to consider upper case in the regular expressions";

        /* input */
        this.regex_input = document.createElement("input");
        this.regex_input.classList.add("form-control");
        this.regex_input.placeholder = "Regular expression";

        this.wrapper.appendChild(header_span);
        this.wrapper.appendChild(this.regex_input);

        /*
        var canvas = document.createElement("canvas");
        canvas.classList.add("partition-chart");
        this.xValues = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Remainder"];
        this.yValues = [12, 19, 3, 5, 2, 3, 4, 6, 7, 19, 3, 5, 2, 3, 4, 6, 7, 19, 3, 5, 2, 3, 4, 6, 7, 2, 1, 2];
        var ctxB = canvas.getContext('2d');
        var myBarChart = new Chart(ctxB, {
            type: 'bar',
            data: {
                labels: this.xValues,
                datasets: [{
                label: '# of active chatters',
                data: this.yValues,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                yAxes: [{
                    ticks: {
                    beginAtZero: true
                    }
                }]
                }
            }
        });
        */
    }

    connectedCallback(){        
        this.appendChild(this.partition_wrapper);
        this.classList.add("partition");
    }

    show(){
        this.classList.add("display-block");
    }

    hide() {
        this.classList.remove("display-block");
    }

    reset() {

    }

    set_partition(regex){
        this.regex_input.value = regex;
    }

    get_partition(){
        return this.regex_input.value;
    }
}

// Define the new elements
customElements.define('player-card', PlayerCard);
customElements.define('controller-element', Controller);
customElements.define('partition-element', Partition);