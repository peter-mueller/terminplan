import { newUhrzeit, newZeitpunktNow, postTermin, Termin, Uhrzeit, Zeitpunkt, zeitpunktMitUhrzeit } from "./js/client.js";
import { handleError } from "./js/error.js";
import { waitReadyState } from "./js/ready.js";
import { mustById } from "./js/template.js";
import { TpButton } from "./js/tp-button.js";
import { TpTermin } from "./js/tp-termin.js";

await waitReadyState();

let t = new Termin();
const now = newZeitpunktNow();
t.spielbeginn = zeitpunktMitUhrzeit(now, newUhrzeit(16,0));
t.treffpunkt = zeitpunktMitUhrzeit(now, newUhrzeit(15,0));
const tpTermin = mustById(document, "termin", TpTermin);
tpTermin.termin = t;


const abbrechenButton = mustById(document, "abbrechen", TpButton);
abbrechenButton.addEventListener('click', (e) => {
    window.location.href = '/';
})


const speichernButton = mustById(document, "speichern", TpButton);
speichernButton.addEventListener('click', async (e) => {
    try {
        await postTermin(tpTermin.termin);
    } catch(err) {
        handleError(err);
        return;
    }
    window.location.href = '/';
})