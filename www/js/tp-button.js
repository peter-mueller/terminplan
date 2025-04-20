import { cloneShadow, mustById, template } from "./template.js";

const t = template(`
    <button id="button">
        <slot></slot>
    </button>    
`);

export class TpButton extends HTMLElement {
    connectedCallback() {
        const shadow = cloneShadow(this, t);
        this.button = mustById(shadow, "button", HTMLButtonElement);
        this.button.addEventListener('click', () => this.click())
    }

    click() {
    }


}

customElements.define("tp-button", TpButton);