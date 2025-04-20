import { DefaultStore } from "./store.js";
import { DateTime } from "./luxon.js";

export class Text {
    value = "";

    toJSON() {
        return this.value;
    }

    unmarshalJSON(data) {
        if (!(typeof data == 'string')) {
            throw new Error("no string")
        }
        this.value = data;
    }
}

export class Zeitpunkt {
    value = "";

    toJSON() {
        return this.value;
    }

    unmarshalJSON(data) {
        if (!(typeof data == 'string')) {
            throw new Error("no string")
        }
        this.value = data;
    }
}

export function newZeitpunktNow() {
    let z = new Zeitpunkt();
    z.value = DateTime.now().toISO();
    return z;
}


export class Datum {
    year = 0;
    month = 0;
    day = 0;

    isZero() {
        return this.year === 0 && this.month === 0 && this.day === 0;
    }
}


export class Uhrzeit {
    stunde = 0;
    minute = 0;
}

/**
 * 
 * @param {number} stunde 
 * @param {number} minute 
 * @returns 
 */
export function newUhrzeit(stunde, minute) {
    let u = new Uhrzeit();
    u.stunde = stunde;
    u.minute = minute;
    return u;
}

/**
 * 
 * @param {Zeitpunkt} z 
 * @param {Uhrzeit} uhrzeit 
 * @returns 
 */
export function zeitpunktMitUhrzeit(z, uhrzeit) {
    let zonedDateTime = DateTime.fromISO(z.value);
    zonedDateTime = zonedDateTime.set({
        hour: uhrzeit.stunde,
        minute: uhrzeit.minute,
        second: 0,
    });

    z = new Zeitpunkt();
    z.value = zonedDateTime.toISO();
    return z;
}

/**
 * 
 * @param {Zeitpunkt} z 
 * @param {Datum} datum 
 * @returns 
 */
export function zeitpunktMitDatum(z, datum) {
    let zonedDateTime = DateTime.fromISO(z.value);
    zonedDateTime = zonedDateTime.set({
        day: datum.day,
        month: datum.month,
        year: datum.year,
    });

    z = new Zeitpunkt();
    z.value = zonedDateTime.toISO();
    return z;
}

export function uhrzeitVonZeitpunkt(z) {
    let zonedDateTime = DateTime.fromISO(z.value);
    var uhrzeit = new Uhrzeit();
    uhrzeit.stunde = zonedDateTime.hour;
    uhrzeit.minute = zonedDateTime.minute;
    return uhrzeit;
}


export function datumVonZeitpunkt(z) {
    let zonedDateTime = DateTime.fromISO(z.value);
    var datum = new Datum();
    datum.year = zonedDateTime.year;
    datum.month = zonedDateTime.month;
    datum.day = zonedDateTime.day;
    return datum;
}


export class Benutzer {
    id = new Text();
    name = new Text();

    unmarshalJSON(data) {
        this.id.unmarshalJSON(data.id);
        this.name.unmarshalJSON(data.name);
    }
}


export async function getAllBenutzer() {
    let response = await DefaultClient.fetch("/benutzer", "GET", null);
    let json = await response.json();
    let allBenutzer = [];
    for (let bJson of json) {
        let b = new Benutzer();
        b.unmarshalJSON(bJson);
        allBenutzer.push(b);
    }
    return allBenutzer;
}


/**
 * 
 * @param {Benutzer} benutzer 
 * @returns 
 */
export async function postBenutzer(benutzer) {
    let body = JSON.stringify(benutzer);
    let r = await DefaultClient.fetch("/benutzer", "POST", body);
    if (!r.ok) {
        throw new Error(r.status)
    }
}

export async function deleteBenutzerById(id) {
    let r = await DefaultClient.fetch("/benutzer/" + id, "DELETE", null);
    if (!r.ok) {
        throw new Error(r.status)
    }
}

export class Termin {
    id = new Text();
    name = new Text();
    ort = new Text();
    gegner = new Text();
    treffpunkt = new Zeitpunkt();
    spielbeginn = new Zeitpunkt();

    unmarshalJSON(data) {
        this.id.unmarshalJSON(data.id);
        this.name.unmarshalJSON(data.name);
        this.ort.unmarshalJSON(data.ort);
        this.gegner.unmarshalJSON(data.gegner);
        this.treffpunkt.unmarshalJSON(data.treffpunkt);
        this.spielbeginn.unmarshalJSON(data.spielbeginn);
    } 
}

class Client {
    store = DefaultStore;

    async fetch(path, method, body) {
        let headers = new Headers();
        let token = this.store.loadToken();
        if (token !== null) {
            headers.set(
                'Authorization',
                "Bearer " + token,
            );
        }

        let r = await fetch(path, {
            method: method,
            body: body,
            headers: headers,
        });
        if (!r.ok) {
            throw new Error(r.status)
        }
        return r;
    }
}

let DefaultClient = new Client();

export class TerminSuche {
    /** @type {Zeitpunkt | null} */
    termineAb = null;
}

/**
 * 
 * @param {TerminSuche} suche 
 * @returns 
 */
export async function getAllTermin(suche) {
    const params = new URLSearchParams();
    if (suche.termineAb !== null) {
        params.set("terminAb", suche.termineAb.toJSON());
    }
    let response = await DefaultClient.fetch("/termin?"+params.toString(), "GET", null);
    let json = await response.json();
    let allTermin = [];
    for (let tJson of json) {
        let t = new Termin();
        t.unmarshalJSON(tJson);
        allTermin.push(t);
    }
    return allTermin;
}

/**
 * 
 * @param {string} id 
 * @returns 
 */
export async function getTerminById(id) {
    let response = await DefaultClient.fetch("/termin/" + id, "GET", null);
    let json = await response.json();

    let t = new Termin();
    t.unmarshalJSON(json);
    return t;
}


/**
 * 
 * @param {Termin} t 
 * @returns {Termin}
 */
export async function postTermin(t) {
    let response = await DefaultClient.fetch("/termin", "POST", JSON.stringify(t));
    let json = await response.json();
    t = new Termin();
    t.unmarshalJSON(json);
    return t;
}

/**
 * 
 * @param {Termin} t 
 * @returns {Termin}
 */
export async function putTermin(t) {
    let response = await DefaultClient.fetch("/termin/"+t.id.value, "PUT", JSON.stringify(t));
    let json = await response.json();
    t = new Termin();
    t.unmarshalJSON(json);
    return t;
}


export const TeilnahmeUnbekannt = "";
export const TeilnahmeJa = "Ja";
export const TeilnahmeNein = "Nein";
export function TeilnahmeValues() {
    return [
        TeilnahmeUnbekannt,
        TeilnahmeJa,
        TeilnahmeNein
    ]
}

export const AufgestelltUnbekannt  = ""
export const AufgestelltJa         = "Ja"
export const AufgestelltNein       = "Nein"
export function AufgestelltValues() {
    return [
        AufgestelltUnbekannt,
        AufgestelltJa,
        AufgestelltNein
    ]
}

export class Teilnahme {
    terminId = new Text();
    benutzerId = new Text();
    typ = new Text();
    aufgestellt = new Text();

    unmarshalJSON(data) {
        this.terminId.unmarshalJSON(data.terminId);
        this.benutzerId.unmarshalJSON(data.benutzerId);
        this.typ.unmarshalJSON(data.typ);
        this.aufgestellt.unmarshalJSON(data.aufgestellt);
    } 
}


/**
 * 
 * @param {Teilnahme} teilnahme  
 * @returns 
 */
export async function putTeilnahme(teilnahme) {
    let body = JSON.stringify(teilnahme);
    let r = await DefaultClient.fetch("/teilnahme", "PUT", body);
    if (!r.ok) {
        throw new Error(r.status)
    }
}


/**
 * 
 * @param {string} id
 * @returns 
 */
export async function getTeilnahmeByTermin(id) {
    let response = await DefaultClient.fetch("/termin/" + id + "/teilnahme", "GET");
    let json = await response.json();
    let allTeilnahmen = [];
    for (let teilnahmeJSON of json) {

        let t = new Teilnahme();
        t.unmarshalJSON(teilnahmeJSON);
        allTeilnahmen.push(t);
    }
    return allTeilnahmen;
}

/**
 * 
 * @param {string}  benutzerId
 * @returns {string} token
 */
export async function getTokenByBenutzer(benutzerId) {
    let response = await DefaultClient.fetch("/benutzer/" + benutzerId + "/token", "GET");
    let tokenString = await response.json();
    return tokenString;
}