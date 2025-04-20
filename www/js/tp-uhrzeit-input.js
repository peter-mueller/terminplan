import { Uhrzeit } from "./client.js";
import { cloneShadow, el, mustById, template } from "./template.js";

const t = template(`
<style>
input {
width: 100%;
min-width: 64px;
font-size: 16px;
height: 32px;
max-width: 128px;

}

label {
    font-size: 14px;
}
</style>

<label for="input" id="label" ></label> <br>
<input id="input" type="time"></input>

`)


export class TpUhrzeitInput extends HTMLElement {
    _disabled = false;
    _value = new Uhrzeit();

    connectedCallback() {

        const shadow = cloneShadow(this, t);

        this.input = mustById(shadow, "input", HTMLInputElement);
        this.input.addEventListener('input', (e) => {
            this.onInput(e);
        })
        const label = mustById(shadow, "label", HTMLLabelElement)
        label.innerText = this.getAttribute("label") ?? "";

        this.render();
    }

    /**
     * @param {Datum} z 
     */
    set value(z) {
        this._value = z;
        this.render();
    }

    /**
     * @param {boolean} disabled;
     */
    set disabled(disabled) {
        this._disabled = disabled;
        this.render();
    }

    /**
     * 
     * @param {InputEvent} e 
     */
    onInput(e) {
        e.stopPropagation();
        
        let inputUhrzeit = new Uhrzeit();
        inputUhrzeit.stunde = new Number(this.input.value.slice(0,2));
        inputUhrzeit.minute = new Number(this.input.value.slice(3,5));

        this._value = inputUhrzeit;
        const customEvent = new CustomEvent("input", {
            composed: true,
            detail: inputUhrzeit
        });
        this.dispatchEvent(customEvent);
        this.render()
    }

    render() {
        if (this.input !== undefined) {
            const uhrzeit = this._value;
            const date = new Date(2000,1,1,uhrzeit.stunde, uhrzeit.minute);
            this.input.value = date.toTimeString().slice(0,5);
            this.input.disabled = this._disabled;
        }
    }
}

customElements.define("tp-uhrzeit-input", TpUhrzeitInput);