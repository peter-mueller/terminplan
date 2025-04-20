import { Anmeldung, DefaultBenutzerService } from "./js/benutzer.js";
import { Benutzer, deleteBenutzerById, getTokenByBenutzer, postBenutzer, Text } from "./js/client.js";
import { handleError } from "./js/error.js";
import { waitReadyState } from "./js/ready.js";
import { el, mustById } from "./js/template.js";
import { TpButton } from "./js/tp-button.js";
import { ConfirmNein, TpConfirm } from "./js/tp-confirm.js";
import { TpTextInput } from "./js/tp-text-input.js";

await waitReadyState()

window.addEventListener('pageshow',async () => {
    init();
})

let benutzerSection = mustById(document, "benutzerlist", HTMLElement);
let tpConfirm = mustById(document, "confirm", TpConfirm);
let tpConfirmInfo = mustById(document, "confirmInfo", TpConfirm);

let benutzerNameInput = mustById(document, "benutzername", TpTextInput);
let benutzerAnlegenButton = mustById(document, "benutzeranlegen", TpButton);
benutzerAnlegenButton.addEventListener('click', async () => {
    let b = new Benutzer();
    b.name = benutzerNameInput.value;
    try {
        await postBenutzer(b)
    } catch(err) {
        handleError(err);
        return;
    }
    benutzerNameInput.value = new Text();
    renderBenutzer();
})

let anmeldung = new Anmeldung();
await init();

async function init() {
    try {
        anmeldung = await DefaultBenutzerService.anmeldung();
    } catch(err) {
        handleError(err);
        return;
    }
    await renderBenutzer();
} 

async function renderBenutzer() {
    DefaultBenutzerService.invalidate();
    let benutzer = await DefaultBenutzerService.benutzerlisteById();
    let bDivs = [];
    for (let [id, b] of benutzer) {
        let bDiv = el("div", HTMLDivElement);
        bDiv.className = "benutzer";
        let nameDiv = el("div", HTMLDivElement);
        nameDiv.className = "name"
        nameDiv.innerText = b.name.value;

        let actions = el("div", HTMLDivElement);
        actions.className = "actions";
        let actionButtons = [];
        if (anmeldung.role === "admin") {
            let tokenErstellenButton = new TpButton();
            tokenErstellenButton.innerText = "Token Erstellen";
            tokenErstellenButton.addEventListener('click', async () => {

                let token = "";
                try {
                    token = await getTokenByBenutzer(id);
                } catch(err) {
                    handleError(err);
                    return;
                }

                const text = el("div", HTMLDivElement);
                text.innerText = 'Token erstelllt für "' + b.name.value + '".';
                
                const anmeldeLink = el("a", HTMLAnchorElement);

                const params = new URLSearchParams();
                params.set("token", token)

                const link = window.location.origin + "/anmelden.html?" + params.toString();
                anmeldeLink.innerText = link;
                anmeldeLink.href = link;
                anmeldeLink.style.wordBreak = 'break-all';

                let elements = [text, anmeldeLink];

                if (navigator.share) {
                    const teilen = new TpButton();
                    teilen.innerText = "Teilen"
                    teilen.addEventListener('click', () => {
                        navigator.share({
                            title: 'Terminplan Anmeldelink',
                            url: link,
                        })
                    })
                    elements.push(teilen);
                }

                tpConfirmInfo.replaceChildren(...elements)
                
                await tpConfirmInfo.waitConfirm();
            })
            actionButtons.push(tokenErstellenButton);

            let loeschenButton = new TpButton();
            loeschenButton.innerText = "Löschen";
            loeschenButton.addEventListener('click', async (e) => {
                tpConfirm.innerText = 'Benutzer "' + b.name.value + '" löschen?';
                const confirmation = await tpConfirm.waitConfirm();
                if (confirmation == ConfirmNein) {
                    return;
                }
                try {
                    await deleteBenutzerById(id);
                } catch(err) {
                    handleError(err);
                    return;
                }

                await renderBenutzer();
            });
            actionButtons.push(loeschenButton);
        }
        actions.replaceChildren(...actionButtons);
        bDiv.replaceChildren(nameDiv, actions);
        bDivs.push(bDiv);
    }

    benutzerSection.replaceChildren(...bDivs);
}