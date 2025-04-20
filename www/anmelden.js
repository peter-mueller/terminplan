import { waitReadyState } from "./js/ready.js";
import { DefaultStore } from "./js/store.js";

await waitReadyState();

let store = DefaultStore;

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') ?? "";
store.saveToken(token);

window.location.href = "/";