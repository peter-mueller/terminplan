
/**
 * 
 * @param {Error} err 
 */
export function handleError(err) {
    console.error(err)
    alert(err.stack);
}