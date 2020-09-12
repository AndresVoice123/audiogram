// Routes and middleware
var render = require("./server/render.js"),
    status = require("./status.js");


var generateSoundwaveVideo = function (theme) {
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
    var hash = status(newReq, null);
    var interval = setInterval(function() { 
        if (hash === 'ready') {
            clearInterval(interval);
        } else {
            hash = status(newReq, null);
        }
        console.log('este es el pinchi status prrrrro', hash);
    }, 3000);
};

const saveVideo = () => {};

module.exports = {
    generateSoundwaveVideo: generateSoundwaveVideo,
    saveVideo: saveVideo,
};