/*
<!--Authorization-->
	<div class="authentication_dialog" id="authentication_dialog">
		<div class="authentication_container" id="authenticate">
			<h1 class="title" style="text-align: center;">Welcome, you just need to login</h1>
			<div class="authentication_content">
				<p id="authentication_text">Please authorize this application to use your twitch account.</p>
				<hr/>
				<p>You would allow this application to:</p>
				<ul>
					<li style="font-size: 1rem;">view live messages in stream chat and rooms</li>
					<li style="font-size: 1rem;">access information about your public Twitch account</li>
					<li style="font-size: 1rem;">
						<div class="form-check form-switch">
						<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
						<label class="form-check-label" for="flexSwitchCheckDefault">ban people?</label>
						</div>
					</li>
				</ul>
				<hr/>
				<p style="font-size: .8rem;">
					This application is not owned or operated by Twitch
				</p>
				<p style="font-size: .8rem;">
					You can manually revoke the authorization in the "Connections" tab under "Other connections" in your Twitch profile settings.
				</p>
			</div>
			<div class="footer">
				<a type="button" class="btn btn-primary" style="margin-top:auto;" href="https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=8kdkq4ayzclx1uwnpj5jyehlsksxgx&redirect_uri=http://localhost:5000/home&scope=chat:read">Authorize</a>
				<span style="padding: 1rem;"> or </span>
				<button type="button" class="btn btn-outline-primary"> Login anonymously</button>
			</div>
		</div>
	</div>
*/

class Authentication extends HTMLElement{
    constructor() {
        super();

        /* divs */
        this.authentication_dialog = document.createElement("div");
        this.authentication_dialog.classList.add("authentication_dialog");
        this.authentication_container = document.createElement("div");
        this.authentication_container.classList.add("authentication_container");  

        /* authenticate-window */
            /* divs */                      
            this.authenticate_window = document.createElement("div");
            this.authenticate_window.classList.add("authenticate-window");
            this.authenticate_wrapper = document.createElement("div");
            var authenticate_content = document.createElement("div");
            authenticate_content.classList.add("authentication_content");
            var authenticate_footer = document.createElement("div");
            authenticate_footer.classList.add("authentication_footer");
            /* buttons */
            var authenticate_twitch_authorize = document.createElement("a");
            authenticate_twitch_authorize.type = "button";
            authenticate_twitch_authorize.classList.add("btn", "btn-primary");
            authenticate_twitch_authorize.href = "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=8kdkq4ayzclx1uwnpj5jyehlsksxgx&redirect_uri=http://localhost:5000/home&scope=chat:read"
            authenticate_twitch_authorize.textContent = "Authorize";
            var authenticate_anonym_btn = document.createElement("button");
            authenticate_anonym_btn.classList.add("btn", "btn-outline-primary");
            authenticate_anonym_btn.textContent = "Login anonymously";

            /* spans, headers, etc*/
            var authenticate_header = document.createElement("h1");
            authenticate_header.classList.add("authentication_title");
            authenticate_header.textContent = "Welcome, you just need to login";
            var authenticate_text = document.createElement("p");
            authenticate_text.textContent = "Please authorize this application to use your twitch account.";
            var authenticate_hr_1= document.createElement("hr");
            var authenticate_allow_text = document.createElement("p");
            authenticate_allow_text.textContent = "You would allow this application to:";
            var authenticate_allow_list = document.createElement("ul");
            var authenticate_allow_list_item_1 = document.createElement("li");
            authenticate_allow_list_item_1.textContent = "view live messages in stream chat and rooms";
            var authenticate_allow_list_item_2 = document.createElement("li");
            authenticate_allow_list_item_2.textContent = "access information about your public Twitch account";
            //var authenticate_allow_list_item_3 = document.createElement("li");
            var authenticate_hr_2= document.createElement("hr");
            var authenticate_disclaimer_text = document.createElement("p");
            authenticate_disclaimer_text.classList.add("authenticate-disclaimer-text")
            authenticate_disclaimer_text.textContent = "This application is not owned or operated by Twitch";
            var authenticate_disclaimer_revoke = document.createElement("p");
            authenticate_disclaimer_revoke.classList.add("authenticate-disclaimer-text")
            authenticate_disclaimer_revoke.textContent = 'You can manually revoke the authorization in the "Connections" tab under "Other connections" in your Twitch profile settings.';
            var authenticate_or_span = document.createElement("span");
            authenticate_or_span.textContent = " or ";
            /* markup */
            this.authenticate_window.appendChild(authenticate_content);
            this.authenticate_wrapper.appendChild(authenticate_content);
            authenticate_content.appendChild(authenticate_header);
            authenticate_content.appendChild(authenticate_text);
            authenticate_content.appendChild(authenticate_hr_1);
            authenticate_content.appendChild(authenticate_allow_text);
            authenticate_content.appendChild(authenticate_allow_list);
            authenticate_allow_list.appendChild(authenticate_allow_list_item_1);
            authenticate_allow_list.appendChild(authenticate_allow_list_item_2);
            authenticate_content.appendChild(authenticate_hr_2);
            authenticate_content.appendChild(authenticate_disclaimer_text);
            authenticate_content.appendChild(authenticate_disclaimer_revoke);
            this.authenticate_wrapper.appendChild(authenticate_footer);
            authenticate_footer.appendChild(authenticate_twitch_authorize);
            authenticate_footer.appendChild(authenticate_or_span);
            authenticate_footer.appendChild(authenticate_anonym_btn);

        /* status-window */
            /* divs */
            this.status_window = document.createElement("div");
            var loader = document.createElement("div");
            loader.classList.add("loader");

            /* buttons */

            /* spans */

            /* markup */
            this.status_window.appendChild(loader);

        /* start-window */
            /* divs */
            this.start_window = document.createElement("div");
            this.start_window.classList.add("authentication-start-window");
            /* buttons */
            var start_button = document.createElement("button");
            start_button.classList.add("btn", "btn-primary");
            start_button.textContent = "Start";
            start_button.onclick = () => {this.hide()};

            /* spans */

            /* markup */
            this.start_window.appendChild(start_button);

        
        /* Markup */
        this.authentication_dialog.appendChild(this.authentication_container);
        this.authentication_container.appendChild(this.authenticate_window);
        this.authentication_container.appendChild(this.start_window);
        this.authentication_container.appendChild(this.status_window);
    }

    connectedCallback(){        
        this.appendChild(this.authentication_dialog);
    }

    show() {
        this.style.display = "block"
    }

    hide() {
        this.style.display = "none"
    }

    show_authenticate_window(localhost = true) {
        this.hide_status_window();
        this.hide_start_window();
        if(localhost)
            this.authenticate_window.appendChild(this.authenticate_wrapper);        
        this.authenticate_window.style.display = "block"
    }

    hide_authenticate_window() {
        this.authenticate_window.style.display = "none"
        if(this.authenticate_window.contains(this.authenticate_wrapper))
            this.authenticate_window.removeChild(this.authenticate_wrapper);
    }

    show_status_window() {        
        this.hide_start_window();
        this.hide_authenticate_window();        
        this.status_window.style.display = "block"
    }

    hide_status_window() {
        this.status_window.style.display = "none"
    }

    update_status() {

    }

    show_start_window(){
        this.hide_status_window();
        this.hide_authenticate_window();       
        this.start_window.style.display = "block"
    }

    hide_start_window(){
        this.start_window.style.display = "none"
    }
}

customElements.define('authentication-window', Authentication);