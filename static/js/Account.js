
class Account extends HTMLElement {
    constructor() {
        super();

        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("account-wrapper");

        this.image = document.createElement("div");
        this.image.classList.add("account-image");

        this.name = document.createElement("span");
        this.name.classList.add("account-name");

        this.options_btn = document.createElement("button");
        this.options_btn.classList.add("account-options-btn");
    }

    connectedCallback(){

    }

    get_image(){
        
    }

    get_name() {
        return this.name.textContent;
    }

    load_account(account_name){
        /**
         * Get account data from twitch
         */
        user_channel = "corbynaut";
    }

    revoke_authorization() {

    }

    clear() {
        
    }

    show_options(){

    }

    hide_options(){

    }
}