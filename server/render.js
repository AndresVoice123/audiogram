var serverSettings = require("../lib/settings/"),
    spawn = require("child_process").spawn,
    path = require("path"),
    _ = require("underscore"),
    logger = require("../lib/logger"),
    transports = require("../lib/transports");

function validate(req, res, next) {

  try {
    console.log('este es el cuerpo', req.body);
    if(!req.body.s3Audio) {
      req.body.theme = JSON.parse(req.body.theme);
    }

  } catch(e) {
    console.log('este es el error xd', e);
    return res.status(500).send("Unknown settings error.");

  }

  if ( (!req.file || !req.file.filename) && !req.body.s3Audio) {
    return res.status(500).send("No valid audio received.");
  }

  // Start at the beginning, or specified time
  if (req.body.start) {
    req.body.start = +req.body.start;
  }

  if (req.body.end) {
    req.body.end = +req.body.end;
  }

  return next();

}

function route(req, res) {
  var id = req.body.s3Audio ? req.body.s3Audio.id : req.file.destination.split(path.sep).pop();
  if(!req.body.s3Audio) {
    transports.uploadAudio(path.join(req.file.destination, "audio"), "audio/" + id,function(err) {
      if (err) {
        throw err;
      }
      addJob(req,res, id);
    });
  } else {
    addJob(req,res, id);
  }

};

function addJob(req, res, id) {
  // Queue up the job with a timestamp
  transports.addJob(_.extend({ id: id, created: (new Date()).getTime() }, req.body));

  res.json({ id: id });

  // If there's no separate worker, spawn one right away
  if (!serverSettings.worker) {

    logger.debug("Spawning worker");

    // Empty args to avoid child_process Linux error
    spawn("bin/worker", [], {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
      env: _.extend({}, process.env, { SPAWNED: true })
    });

  }
}

module.exports = {
  validate: validate,
  route: route
};
