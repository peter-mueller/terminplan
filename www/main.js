import { DefaultBenutzerService } from "./js/benutzer.js";
import { datumVonZeitpunkt, getAllTermin, newUhrzeit, newZeitpunktNow, Termin, TerminSuche, zeitpunktMitDatum, zeitpunktMitUhrzeit } from "./js/client.js";
import { handleError } from "./js/error.js";
import { formatZeitpunkt } from "./js/format.js";
import { waitReadyState } from "./js/ready.js";
import { el, mustById } from "./js/template.js";
import { TpDatumInput } from "./js/tp-datum-input.js";
import { TpMe } from "./js/tp-me.js";
import { TpTermin } from "./js/tp-termin.js";

await waitReadyState()

window.addEventListener('pageshow',async () => {
    init();
})

let tpMe = mustById(document, "me", TpMe);
let termineAbInput = mustById(document, "termineAb", TpDatumInput);
let terminliste = mustById(document, "terminliste", HTMLDivElement);
termineAbInput.value = datumVonZeitpunkt(newZeitpunktNow());
termineAbInput.addEventListener('input', () => {
    renderTermine();
})

await init();

async function init() {
    try {
        tpMe.me = await DefaultBenutzerService.anmeldung();
    } catch(err) {
        handleError(err);
        return;
    }
    
    renderTermine();
} 


async function renderTermine() {
    let suche = new TerminSuche();
    if (!termineAbInput.value.isZero()) {
        let termineAb = newZeitpunktNow();
        termineAb = zeitpunktMitDatum(termineAb, termineAbInput.value);
        termineAb = zeitpunktMitUhrzeit(termineAb, newUhrzeit(0,0));
        suche.termineAb = termineAb;
    }

    /**
     * @type {Termin[]}
     */
    let termine = [];
    try {
        termine = await getAllTermin(suche);
    } catch(err) {
        handleError(err);
        return;
    }
    let divTermine = [];
    for (let t of termine) {

        let titleLink = el("a", HTMLAnchorElement);
        titleLink.innerText = [formatZeitpunkt(t.spielbeginn), t.ort.value].join(" ");
        titleLink.href = "/termin.html?id=" + t.id.value; 
    
        let tpTermin = new TpTermin();
        tpTermin.termin = t;
        tpTermin.disabled = true;

        let div = el("div", HTMLDivElement);
        div.className = "termin"
        div.replaceChildren(titleLink, tpTermin);

        divTermine.push(div);
    }
    terminliste.replaceChildren(...divTermine);
}