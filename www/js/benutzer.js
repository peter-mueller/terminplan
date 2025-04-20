import { Benutzer, getAllBenutzer } from "./client.js";
import { DefaultStore } from "./store.js";

export function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export const RoleAdmin = "admin"

export class Anmeldung {
    role = "";
    benutzer = new Benutzer();
}

export class BenutzerService { 
    store = DefaultStore;
    /**
     * @type {Map<string,Benutzer> | null}
     */
    _benutzerlisteById = null;

    async anmeldung() {
        const token = this.store.loadToken();
        if (token === "") {
            return null;
        }

        const anmeldung = new Anmeldung();
        let jwt = parseJwt(token)
        const sub = jwt.sub;
        anmeldung.role = jwt.role;
        anmeldung.benutzer = await this.benutzerById(sub);
        return anmeldung;
    }

    async benutzerById(id) {
        const benutzer = await this.benutzerlisteById();
        let b = benutzer.get(id);
        if (b === undefined) { 
            return  new Benutzer();
        }
        return b;
    }

    /**
     * 
     * @returns {Map<string, Benutzer>}
     */
    async benutzerlisteById() {
        if (this._benutzerlisteById == null) {
            let benutzerliste = await getAllBenutzer();
            /**
             * @type {Map<string, Benutzer>}
             */
            let m = new Map();
            for (let b of benutzerliste) {
                m.set(b.id.value, b);
            }
            this._benutzerlisteById = m;
        }
        return this._benutzerlisteById;
    }

    invalidate() {
        this._benutzerlisteById = null;
    }
}

export let DefaultBenutzerService = new BenutzerService();