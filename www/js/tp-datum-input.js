import { Datum } from "./client.js";
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
<input id="input" type="date"></input>

`)


export class TpDatumInput extends HTMLElement {
    _disabled = false;
    _value = new Datum();

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

    get value() {
        return this._value;
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
        
        let inputDatum = new Datum();
        if (this.input.value !== "") {
            inputDatum.year = Number.parseInt(this.input.value.slice(0,4));
            inputDatum.month = Number.parseInt(this.input.value.slice(5,7));
            inputDatum.day = Number.parseInt(this.input.value.slice(8,10));
        }
        this._value = inputDatum;
        const customEvent = new CustomEvent("input", {
            composed: true,
            detail: inputDatum
        });
        this.dispatchEvent(customEvent);
        this.render()
    }

    render() {
        if (this.input !== undefined) {
            const datum = this._value;
            if (datum.year === 0 && datum.month === 0 && datum.day == 0) {
                this.input.value = "";
            } else {
                this.input.value = String(datum.year).padStart(4, "0")
                + "-" + String(datum.month).padStart(2, "0") + "-" + String(datum.day).padStart(2, "0");
            }
            this.input.disabled = this._disabled;
        }
    }
}

customElements.define("tp-datum-input", TpDatumInput);