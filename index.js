// Routes and middleware
var render = require("./server/render.js"),
    status = require("./server/status.js");


var generateSoundwaveVideo = function (theme) {
    var req = {
        body: {
            theme,
        },
    };
    var response = render.route(req, null);
    console.log('esta es la respuesta', response);
    var newReq = {
        params: {
            id: response.id,
        },
    };
    console.log('este es el new rq papuh de papuhs', newReq);
    var hash = status(newReq, null);

    var promise = new Promise( function (resolve, reject) {
        var interval = setInterval(function() { 
            if (hash === 'ready') {
                clearInterval(interval);
                resolve(hash);
            } else {
                hash = status(newReq, null);
            }
            console.log('este es el pinchi status prrrrro', hash);
        }, 3000);
    });

    return promise;
};

const saveVideo = () => {};

module.exports = {
    generateSoundwaveVideo: generateSoundwaveVideo,
    saveVideo: saveVideo,
};