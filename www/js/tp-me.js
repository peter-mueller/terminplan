import { cloneShadow, el, mustById, template } from "./template.js";
import { Benutzer } from "./client.js";
import { Anmeldung, RoleAdmin } from "./benutzer.js";

const t = template(`
    <div id="me"></div>
    <ul id="actionList">

    </ul>
`);

export class TpMe extends HTMLElement {
    constructor() {
        super();
        const shadow = cloneShadow(this, t);
        this.meDiv = mustById(shadow, "me", HTMLDivElement);
        this.actionList = mustById(shadow, "actionList", HTMLUListElement);

    }

    /**
     * @param {Anmeldung | null} anmeldung  
     */
    set me(anmeldung) {
        if (anmeldung === null) {
            this.meDiv.innerText = "Nicht angemeldet";
            return;
        }

        const benutzer = anmeldung.benutzer;
        this.meDiv.innerText = "Angemeldet als " + benutzer.name.value;

        let actions = [];
        if (anmeldung.role === RoleAdmin) {
            const adminActions = [
                listLink("Termin anlegen", "/terminanlegen.html"),
                listLink("Benutzer", "/benutzer.html")
            ];
            actions.push(...adminActions)
        }
        this.actionList.replaceChildren(...actions);
    }


}

function listLink(name, href) {
    const li = el("li", HTMLLIElement);
    const a = el("a", HTMLAnchorElement);
    a.href = href;
    a.innerText = name;
    li.append(a);
    return li;
}

customElements.define("tp-me", TpMe);