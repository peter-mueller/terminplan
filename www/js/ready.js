

export async function waitReadyState() {
    return new Promise((resolve) => {
            let intervalId = "";
            intervalId = setInterval(() => {
                if (document.readyState === 'complete') {
                    clearInterval(intervalId);
                    resolve();
                    setTimeout(() => {
                        document.body.style.display = "unset";

                    },10)

                }
            }, 50)
    }) 
}