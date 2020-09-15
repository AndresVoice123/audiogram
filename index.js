// Routes and middleware
var render = require("./server/render.js"),
    promiseStatus = require("./server/promiseStatus.js");

module.exports = class Audiogram {
    constructor(envVariables) {
        Object.keys(envVariables).forEach(function(key) {
            process.env[key] = envVariables[key];
        });
    }

    async generateSoundwaveVideo(theme) { 
        var req = {
            body: {
                theme,
            },
        };
    
        var response = render.route(req, null);
        var newReq = {
            params: {
                id: response.id,
            },
        };
        var hash = await promiseStatus(newReq, null);
    
        var promise = new Promise( async function (resolve, reject) {
            var interval = setInterval(async function() { 
                try {
                    console.log('este es el hash recibido', hash);
                    if (hash.status === 'ready') {
                        clearInterval(interval);
                        resolve(hash.status);
                    } else if (hash.status === 'error') {
                        clearInterval(interval);
                        reject(hash.error);
                    } else {
                        hash = await promiseStatus(newReq, null);
                    }
                }
                catch(err) {
                    throw err;
                }
            }, 3000);
        });
        return promise;
    };
}