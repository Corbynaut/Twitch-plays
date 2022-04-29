class Autocomplete{
    constructor(update_fn){
        const this_autocomplete = this;
        this.update_fn = update_fn;

        this.node = document.createElement("div");
        this.node.classList.add("dropdown")
        this.input = document.createElement("input");
        this.input.classList.add("form-control");
        this.dropdown_menu = document.createElement("div");
        //this.dropdown_menu.classList.add("dropdown-menu")

        this.node.appendChild(this.input);
        this.node.appendChild(this.dropdown_menu);

        this.input.addEventListener("input", function() {
            console.log("input.value changed")
            this_autocomplete.update_fn(this_autocomplete);
        });
    }

    clear(){
        this.clear_list();
        this.input.value = "";
    }

    clear_list(){
        while(this.dropdown_menu.firstChild){
            this.dropdown_menu.removeChild(this.dropdown_menu.firstChild);
        }
    }

    add_menu_item(item){    
        if(!(item instanceof AutocompleteItem) || this.input.value == "") {
            this.clear_list();
            return;
        }
        console.log("adding autocomplete item")
        this.dropdown_menu.appendChild(item.node);
    }

    add_list(items){
        if(this.input.value == "") {
            this.clear_list();
            return;
        }
        items.forEach(item => {
            this.add_menu_item(item);
        });
    }
}

//Abstract class
class AutocompleteItem{
    constructor(autocomplete){
        if(new.target === AutocompleteItem)
            throw new TypeError("AutocompleteItem is an abstract class and cannot be constructed directly");

        this.autocomplete = autocomplete;
        this.node = document.createElement("div");
        this.node.classList.add("autocomplete-item")
        this.node.onclick = this.onclick;
    }

    onclick(){
        console.log("AutocompleteItem onclick function was not updated");
    }
}

class AutocompleteItemChannel extends AutocompleteItem{
    constructor(autocomplete, display_name, image_url){
        super(autocomplete);
        this.display_name = display_name;
        this.image_url = image_url;

        this.node.classList.add("autocomplete-item-channel")
        this.node.onclick = this.onclick;
        var image = document.createElement("img");
        //image.src = image_url;
        var channel = document.createElement("span");
        channel.textContent = display_name;

        this.node.appendChild(image);
        this.node.appendChild(channel);
    }

    onclick(){
        this.autocomplete.input.value = this.display_name;
    }
}