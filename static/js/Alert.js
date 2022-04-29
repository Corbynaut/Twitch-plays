class AlertManager{
    constructor(div){
        this.div = div;
        this.div.classList.add("alert-manager");
        this.timeout = null;
        this.alert_queue = [];
    }

    add(type, body_text){
        var alert = new Alert(this, type, body_text);
        this.alert_queue.push(alert);
        if(this.alert_queue.length == 1 && this.timeout==null)
            this.show_alert();
    }

    show_alert(){      
        var alert = this.alert_queue.shift();
        this.div.appendChild(alert.node);
        this.timeout = new TimeOut(3000, ()=>{console.log("interval");this.dismiss_alert()})//setInterval(()=>{console.log("interval");this.dismiss_alert()}, 3000)
        this.timeout.start();
    }

    dismiss_alert(){
        this.timeout.pause();
        this.timeout = null;
        while(this.div.firstChild){
            this.div.removeChild(this.div.firstChild);
        }
        if(this.alert_queue.length > 0)            
            this.show_alert();
    }
}

class Alert{
    constructor(alert_manager, type, body_text){
        this.alert_manager = alert_manager;
        this.type = type;
        const types = ["info", "primary", "secondary", "success", "warning", "danger"];
        if(!types.includes(this.type))
            this.type = "info";

        this.node = document.createElement("div");
        this.node.classList.add("alert", `alert-${this.type}`, "alert-dismissible");
        var body = document.createElement("p");
        body.classList.add("alert-text");
        body.textContent = body_text;
        var close_button = document.createElement("button");
        close_button.classList.add("btn-close");
        close_button.onclick = () => {this.alert_manager.dismiss_alert()};

        this.node.appendChild(close_button);
        this.node.appendChild(body);

        $(this.node).on("mouseover", () => {
           this.alert_manager.timeout.pause();
        });
        $(this.node).on("mouseleave", () => {
            this.alert_manager.timeout.resume();
         });
    }
}

class TimeOut{
    constructor(duration, func, ...params){
        this.duration = duration;
        this.func = func.bind(null, ...params);
        this.end_time = new Date().getTime() + this.duration;
        this.id = null;
    }

    start(){        
        this.id = setTimeout(this.func, this.duration);
    }

    pause(){
        if(this.id != null) {
            clearTimeout(this.id);
            this.id = null;
            this.duration = this.end_time - new Date().getTime();
        }
    }

    resume(){
        this.id = setTimeout(this.func, this.duration);
    }
}