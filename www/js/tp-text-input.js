import { Text } from "./client.js";
import { cloneShadow, el, mustById, template } from "./template.js";

const t = template(`
<style>
input {
width: 100%;
min-width: 64px;
font-size: 16px;
height: 32px;
}

label {
    font-size: 14px;
}
</style>

<div>
<label for="input" id="label"></label> <br>
<input id="input" type="text"></input>
</div>
`)

export class TpTextInput extends HTMLElement {
    _text = new Text();
    _disabled = false;

    connectedCallback() {

        const shadow = cloneShadow(this, t);

        this.input = mustById(shadow, "input", HTMLInputElement)
        this.input.addEventListener("input", (e) => {
            this.onInput(e);
        })
        const label = mustById(shadow, "label", HTMLLabelElement)
        label.innerText = this.getAttribute("label") ?? "";

        this.input.disabled = this.hasAttribute("disabled")
    }

    /**
     * @param {Text} t 
     */
    set value(t) {
        this._text = t;
        this.render();
    }

    get value() {
        return this._text;
    }

    /**
     * @param {boolean} disabled
     */
    set disabled(disabled) {
        this._disabled = disabled;
        this.render();
    }

    render() {
        if (this.input !== undefined) {
            this.input.value = this._text.value;
            this.input.disabled = this._disabled;
        }
    }


    /**
     * 
     * @param {InputEvent} e 
     */
    onInput(e) {
        e.stopPropagation();
        const text = new Text();
        text.value = this.input.value;
        this._text= text;
        const customEvent = new CustomEvent("input", {
            composed: true,
            detail: text
        });
        this.dispatchEvent(customEvent);
        this.render()
    }

}


customElements.define("tp-text-input", TpTextInput);