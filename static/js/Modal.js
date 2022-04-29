class Modal{
    constructor () {   
        /* divs */
        this.modal = document.createElement("div");
        this.modal.classList.add("modal", "fade");
        this.modal_dialog = document.createElement("div");
        this.modal_dialog.classList.add("modal-dialog");
        this.modal_content = document.createElement("div");
        this.modal_content.classList.add("modal-content");
        this.header = document.createElement("div");
        this.header.classList.add("modal-header");
        this.body = document.createElement("div");
        this.body.classList.add("modal-body");
        this.modal_footer = document.createElement("div");
        this.modal_footer.classList.add("modal-footer");
        /* button */
        var close_button = document.createElement("button");
        close_button.classList.add("btn", "btn-secondary", "modal-close-button");
        close_button.onclick = () => {this.hide();};
        close_button.textContent = "Close";

        /*
        this.action_button = document.createElement("button");
        this.action_button.classList.add("btn", "btn-primary");
        this.action_button.textContent = "Action";
        */

        this.modal.appendChild(this.modal_dialog);
        this.modal_dialog.appendChild(this.modal_content);
        this.modal_content.appendChild(this.header);
        this.modal_content.appendChild(this.body);
        this.modal_content.appendChild(this.modal_footer);
        this.modal_footer.appendChild(close_button);
    }

    show(){
        $(this.modal).modal("show");
    }

    hide(){
        $(this.modal).modal("hide");        
    }
}
