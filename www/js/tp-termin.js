import { cloneShadow, el, mustById, template } from "./template.js";
import { Datum, datumVonZeitpunkt, Termin, uhrzeitVonZeitpunkt, zeitpunktMitDatum, zeitpunktMitUhrzeit } from "./client.js";
import { TpDatumInput } from "./tp-datum-input.js";
import { TpUhrzeitInput } from "./tp-uhrzeit-input.js";

import { TpTextInput } from "./tp-text-input.js";

const t = template(`
<style>
    #termin {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .row {
        display: flex;
        flex-direction: row;
        gap: 4px;
    }

    tp-text-input, tp-datum-input, tp-uhrzeit-input, .inputSpacer {
        flex-basis: 128px;
        flex-grow: 1;
    }
</style>
<div id="termin">

    <div class="row">
        <tp-text-input label="Name" id="name"></tp-text-input>
    </div>
    <div class="row">
            <tp-text-input label="Ort" id="ort"></tp-text-input>

        <tp-text-input label="Gegner" id="gegner"></tp-text-input>    
        </div>

    <div class="row">
    <tp-datum-input label="Datum" id="datum"></tp-datum-input>
        <tp-uhrzeit-input label="Treffpunkt" id="treffpunkt"></tp-uhrzeit-input>

    </div>

    <div class="row">
        <div class="inputSpacer"></div>
        <tp-uhrzeit-input label="Spielbeginn" id="spielbeginn"></tp-uhrzeit-input>
    </div>

</div>
`)

export class TpTermin extends HTMLElement {

    _termin = new Termin();
    _disabled = false;

    connectedCallback() {
        this.shadow = cloneShadow(this, t);

        this.datumInput = mustById(this.shadow, "datum", TpDatumInput)
        this.onInput(this.datumInput, (value) => {
            const t = this._termin;
            this._termin.spielbeginn = zeitpunktMitDatum(t.spielbeginn, value);
            this._termin.treffpunkt = zeitpunktMitDatum(t.treffpunkt, value);
            this.render();
        });

        this.spielbeginnInput = mustById(this.shadow, "spielbeginn", TpUhrzeitInput)
        this.onInput(this.spielbeginnInput, (value) => {
            const t = this._termin;
            this._termin.spielbeginn = zeitpunktMitUhrzeit(t.spielbeginn, value);
        });

        this.treffpunktInput = mustById(this.shadow, "treffpunkt", TpUhrzeitInput);
        this.onInput(this.treffpunktInput, (value) => {
            const t = this._termin;
            this._termin.treffpunkt = zeitpunktMitUhrzeit(t.treffpunkt, value);
        });

        this.nameInput = mustById(this.shadow, "name", TpTextInput)
        this.onInput(this.nameInput, (value) => {
            this._termin.name = value;
        });
        this.ortInput = mustById(this.shadow, "ort", TpTextInput)
        this.onInput(this.ortInput, (value) => {
            this._termin.ort = value;
        });
        this.gegnerInput = mustById(this.shadow, "gegner", TpTextInput)
        this.onInput(this.gegnerInput, (value) => {
            this._termin.gegner = value;
        });





        this.render();
    }

    /**
     * @param {Termin} t 
     */
    set termin(t) {
        this._termin = t;
        this.render()
    }

    get termin() {
        return this._termin;
    }

    /**
     * @param {boolean} d
     */
    set disabled(d) {
        this._disabled = d;
        this.render();
    }

    render() {
        this.renderInput(this.nameInput, this._termin.name);
        this.renderInput(this.ortInput, this._termin.ort);
        this.renderInput(this.gegnerInput, this._termin.gegner);

        const datum = datumVonZeitpunkt(this._termin.spielbeginn);
        this.renderInput(this.datumInput, datum);
        const spielbeginnUhrzeit = uhrzeitVonZeitpunkt(this._termin.spielbeginn);
        this.renderInput(this.spielbeginnInput, spielbeginnUhrzeit);
        const treffpunktUhrzeit = uhrzeitVonZeitpunkt(this._termin.treffpunkt);
        this.renderInput(this.treffpunktInput, treffpunktUhrzeit);
    }


    renderInput(target, value) {
        if (target === undefined) {
            return;
        }
        target.value = value;
        target.disabled = this._disabled;
    }

    onInput(target, setFunc) {
        target.addEventListener('input', (e) => {
            setFunc(e.detail);
            this.render();

            const customEvent = new CustomEvent("input", {
                composed: true,
                detail: this._termin,
            });
            this.dispatchEvent(customEvent);
        });
    }
}


customElements.define("tp-termin", TpTermin);