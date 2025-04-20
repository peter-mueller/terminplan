export function template(templateString) {
    let t = document.createElement('template');
    t.innerHTML = templateString;
    return t;
}


export function cloneShadow(host, template) {
    let shadow = host.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    return shadow;
}

/**
 * @template T
 * @typedef {new (...args: any[]) => T} Class<T>
 */

/**
 * 
 * @template {HTMLElement} T
 * @param {Node} node 
 * @param {string} id 
 * @param {Class<T>} type 
 * @returns {T}
 */
export function mustById(node, id, type) {
    let el = node.getElementById(id);

    if (el instanceof type) {
        return el;
    }
    throw new Error(printString("id", id, "with type", type, "not found"));
}

/**
 * 
 * @template {HTMLElement} T
 * @param {string} tagname 
 * @param {Class<T>} type 
 * @returns {T}
 */
export function el(tagname, type) {
    let e = document.createElement(tagname);

    if (e instanceof type) {
        return e;
    }
    throw new Error(printString("tag", tagname, "does not match type", type));
}

function printString(...any) {
    return any.join(" ")
}