import { Anmeldung, DefaultBenutzerService, RoleAdmin } from "./js/benutzer.js";
import { Benutzer, getTeilnahmeByTermin, getTerminById, putTeilnahme, putTermin, Teilnahme } from "./js/client.js";
import { handleError } from "./js/error.js";
import { waitReadyState } from "./js/ready.js";
import { mustById } from "./js/template.js";
import { TpButton } from "./js/tp-button.js";
import { TpTeilnahme } from "./js/tp-teilnahme.js";
import { TpTermin } from "./js/tp-termin.js";

await waitReadyState();

window.addEventListener('pageshow',async () => {
    init();
})

const urlParams = new URLSearchParams(window.location.search);
const terminId = urlParams.get('id') ?? "";
let tpTermin = mustById(document, "termin", TpTermin);
const speichernButton = mustById(document, "speichern", TpButton);
speichernButton.addEventListener('click', async (e) => {
    try {
        let t = await putTermin(tpTermin.termin);
        tpTermin.termin = t;
        renderTermin();
    } catch(err) {
        handleError(err);
        return;
    }
})
let teilnahmenDiv = mustById(document, "teilnahmen", HTMLDivElement);
let anmeldung = new Anmeldung();
init();

async function init() {
    try {
        anmeldung = await DefaultBenutzerService.anmeldung();
    } catch(err) {
        handleError(err);
        return;
    }
    await renderTermin();
    await renderTeilnahme();
}


async function renderTermin() {
    try {
        tpTermin.termin = await getTerminById(terminId);
    } catch(err) {
        handleError(err);
        return;
    }

    if (anmeldung.role !== RoleAdmin) {
        speichernButton.style.display = 'none';
        tpTermin.disabled = true;
    }
}

async function renderTeilnahme() {
    /**
     * @type {Teilnahme[]}
     */
    let teilnahmen = [];
    try {
        teilnahmen = await getTeilnahmeByTermin(terminId);
    } catch(err) {
        handleError(err);
        return;
    }
    let benutzerIdMitTeilnahme = new Set();
    for (let t of teilnahmen) {
        benutzerIdMitTeilnahme.add(t.benutzerId.value);
    }

    /**
     * @type {Map<string, Benutzer>}
     */
    let benutzerliste = new Map();
    try {
        benutzerliste = await DefaultBenutzerService.benutzerlisteById();
    } catch(err) {
        handleError(err);
        return;
    }
    for (let [benutzerId,b] of benutzerliste.entries()) {
        if (benutzerIdMitTeilnahme.has(benutzerId)) {
            continue;
        }
        let t = new Teilnahme();
        t.benutzerId.value = benutzerId;
        t.terminId.value = terminId;
        teilnahmen.push(t);
    }

    teilnahmen.sort((a, b) => {
        if (a.benutzerId.value == anmeldung.benutzer.id.value) {
            return -1;
        }
        if (b.benutzerId.value == anmeldung.benutzer.id.value) {
            return 1;
        }
        const aName = benutzerliste.get(a.benutzerId.value).name.value;
        const bName = benutzerliste.get(b.benutzerId.value).name.value;
        return aName.localeCompare(bName);
    })
    
    let tpTeilnahmen = [];
    for (let t of teilnahmen) {
        let tpTeilnahme = new TpTeilnahme();
        tpTeilnahme.value = t;
        tpTeilnahme.addEventListener('input', async (e) => {
            try {
                await putTeilnahme(e.detail);
            } catch(err) {
                handleError(err);
                return;
            }
            renderTeilnahme();
        })
        tpTeilnahmen.push(tpTeilnahme);
    }
    teilnahmenDiv.replaceChildren(...tpTeilnahmen);
}