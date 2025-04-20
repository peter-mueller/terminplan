import { Zeitpunkt } from "./client.js";

/**
 * 
 * @param {Zeitpunkt} z 
 */
export function formatZeitpunkt(z) {
    let date = new Date(z.value);
    return date.toLocaleString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}