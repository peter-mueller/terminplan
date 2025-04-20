import { cloneShadow, mustById, template } from "./template.js";
import { TpButton } from "./tp-button.js";

const t = template(`
    <style>
        #dialog {
            margin-top: 128px;
            max-width: 512px;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        #actions {
            display: flex;
            flex-direction: row;
            gap: 4px;
            justify-content: flex-end;
        }
    </style>
    <dialog id="dialog">
    <div class="container">
        
        <slot></slot>

        <div id="actions">
            <tp-button id="nein">Nein</tp-button>
            <tp-button id="ja">Ja</tp-button>
        </div>
        </div>
    </dialog>
`);

/**
 * @typedef  {string}  Confirm
 */
/**
 * @type {Confirm}
 */
export const ConfirmJa = "Ja"

/**
 * @type {Confirm}
 */
export const ConfirmNein = "Nein"

export class TpConfirm extends HTMLElement {
    /**
     * @type {Promise<Confirm> | null}
     */
    _confirmationResolve = null;

    connectedCallback() {
        const shadow = cloneShadow(this, t);
        this.dialog = mustById(shadow, "dialog", HTMLDialogElement);
        this.buttonNein = mustById(shadow, "nein", TpButton);
        this.buttonJa = mustById(shadow, "ja", TpButton);

        if (this.hasAttribute("info")) {
            this.buttonNein.style.display = 'none';
            this.buttonJa.innerText = "OK";
        }

        this.buttonJa.addEventListener('click', () => {
            this._confirmationResolve(ConfirmJa)
        })
        this.buttonNein.addEventListener('click', () => {
            this._confirmationResolve(ConfirmNein)
        })
    }

    async waitConfirm() {
        if (this._confirmationResolve !== null) {
            this._confirmationResolve(ConfirmNein);
            throw new Error("must not happen")

        }

        this.dialog.showModal();
        /**
         * @type {Promise<Confirm>}
         */
        let p = new Promise((resolve) => {
            this._confirmationResolve = (confirm) => {
                this.dialog.close();
                this._confirmationResolve = null;
                resolve(confirm);
            };
        })
        return await p;
    }


}

customElements.define("tp-confirm", TpConfirm);