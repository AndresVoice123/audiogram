var fs = require("fs"),
    path = require("path"),
    Canvas = require("canvas"),
    getRenderer = require("../renderer/")
    transports = require("../lib/transports/");

function initializeCanvas(theme, cb) {

  // Fonts pre-registered in bin/worker
  var renderer = getRenderer(theme);

  if (!theme.backgroundImage) {
    return cb(null, renderer);
  }

  if (theme.backgroundImage) {
    transports.downloadAudio("images/" + theme.backgroundImage, path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage), function(err, data) {
      if (err) {
        throw err;
      }
      console.log('esta es la data', data);
      // Load background image from file (done separately so renderer code can work in browser too)
      fs.readFile(path.join(__dirname, "..", "settings", "backgrounds", theme.backgroundImage), function(err, raw){

        if (err) {
          return cb(err);
        }

        var bg = new Canvas.Image;
        bg.src = raw;
        renderer.backgroundImage(bg);

        return cb(null, renderer);

      });
    });
  } 

}

module.exports = initializeCanvas;
