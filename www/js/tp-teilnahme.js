import { DefaultBenutzerService } from "./benutzer.js";
import { AufgestelltValues, Benutzer, Teilnahme, TeilnahmeValues, Text } from "./client.js";
import { cloneShadow, el, mustById, template } from "./template.js";

const t = template(`
<style>
#teilnahme {
    display: flex;
    flex-direction: row;
    gap: 4px;
}

#typ, #aufgestellt {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

#benutzer {
    font-family: monospace, system-ui, sans-serif;
    flex-basis: 20px;
    flex-grow: 1;
}

input[type="radio"] {
    height: 16px;
    width: 16px;
    font-size: 16px;

}

label {
    font-size: 16px;
}

#aufgestellt>label, #typ>label {
    font-size: 14px;
}
</style>

<div id="teilnahme">
    <div id="benutzer"></div>
    <div id="typ">
            <label>Teilnahme</label>
        <div>
            <input type="radio" id="teilnahmeInput">
            <label for="teilnahmeInput">Unbekannt</label>
        </div>
        <div>
            <input type="radio" id="teilnahmeInputJa">
            <label for="teilnahmeInputJa">Ja</label>
        </div>
        <div>
            <input type="radio" id="teilnahmeInputNein">
            <label for="teilnahmeInputNein">Nein</label>
        </div>

    </div>
    <div id="aufgestellt">
        <label>Aufgestellt</label>
        <div>
            <input type="radio" id="aufgestelltInput">
            <label for="aufgestelltInput">Unbekannt</label>
        </div>
        <div>
            <input type="radio" id="aufgestelltInputJa">
            <label for="aufgestelltInputJa">Ja</label>
        </div>
        <div>
            <input type="radio" id="aufgestelltInputNein">
            <label for="aufgestelltInputNein">Nein</label>
        </div>
    </div>

</div>
`)

export class TpTeilnahme extends HTMLElement {
    _teilnahme = new Teilnahme();
    _disabled = false;
    
    /**
     * @type {Map<string, HTMLInputElement>}
     */
    _aufgestelltInputs = new Map();


    /**
     * @type {Map<string, HTMLInputElement>}
     */
    _teilnahmeInputs = new Map();

    connectedCallback() {

        const shadow = cloneShadow(this, t);

        this.benutzerDiv = mustById(shadow, "benutzer", HTMLDivElement);

        for (let aufgestellt of AufgestelltValues()) {
            let input = mustById(shadow, "aufgestelltInput"+aufgestellt, HTMLInputElement);
            this._aufgestelltInputs.set(aufgestellt, input);
            this.onInput(input, () => {
                if (input.checked) {
                    this._teilnahme.aufgestellt.value = aufgestellt;
                }
            });
        }
        for (let typ of TeilnahmeValues()) {
            let input = mustById(shadow, "teilnahmeInput"+typ, HTMLInputElement);
            this._teilnahmeInputs.set(typ, input);
            this.onInput(input, () => {
                if (input.checked) {
                    this._teilnahme.typ.value = typ;
                }
            });
        }

        this.render();
    }

    /**
     * @param {Teilnahme} t 
     */
    set value(t) {
        this._teilnahme = t;
        this.render();
    }

    /**
     * @param {boolean} disabled
     */
    set disabled(disabled) {
        this._disabled = disabled;
        this.render();
    }

    async render() {
        let benutzerById = await DefaultBenutzerService.benutzerById(this._teilnahme.benutzerId.value);
        
        if (this.benutzerDiv !== undefined) {
            this.benutzerDiv.innerText = benutzerById.name.value;
        }
        for (let [typ, input] of this._teilnahmeInputs) {
            input.checked = typ == this._teilnahme.typ.value;
        }

        for (let [aufgestellt, input] of this._aufgestelltInputs) {
            input.checked = aufgestellt == this._teilnahme.aufgestellt.value;
        }
    }

    onInput(target, setFunc) {
        target.addEventListener('input', (e) => {
            e.stopPropagation();
            setFunc();
            this.render();

            const customEvent = new CustomEvent("input", {
                composed: true,
                detail: this._teilnahme,
            });
            this.dispatchEvent(customEvent);
        });
    }

}


customElements.define("tp-teilnahme", TpTeilnahme);