export class Store {

    /**
     * 
     * @param {string} token 
     */
    saveToken(token) {
        localStorage.setItem('token', token)
    }

    /**
     * 
     * @returns {string}
     */
    loadToken() {
        return localStorage.getItem('token') || ""
    }

}


export let DefaultStore = new Store();