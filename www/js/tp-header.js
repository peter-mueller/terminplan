import { cloneShadow, mustById, template } from "./template.js";

const t = template(`
    <style>
        #header {
            display: flex;
            flex-direction: row;
            background-color: palegoldenrod;
            padding: 8px;
            align-items: center;
        }


        #header h1 {
            margin: 0;
        }

        a {
            text-decoration: none;
            color: black;
        }
    </style>

    <header id="header">
        <h1><a href="/">Terminplan</a></h1>
        <img src="/images/football.gif" width="32px" height="32px">
    </header>  
`);

export class TpHeader extends HTMLElement {
    constructor() {
        super();
        const shadow = cloneShadow(this, t);
    }

}

customElements.define("tp-header", TpHeader);