var AWS = require("aws-sdk"),
    fs = require("fs");

module.exports = function(bucket, storagePath) {

  var s3 = new AWS.S3({ params: { Bucket: bucket } });

  // Test credentials
  s3.headBucket({}, function(err){ if (err) { throw err; } });

  function upload(source, key, cb) {

    var params = {
      Key: storagePath + key,
      Body: fs.createReadStream(source),
      ACL: "public-read"
    };

    // gzipping results in inconsistent file size :(
    s3.upload(params, cb);

  }

  function download(key, destination, cb) {
    const path = key.path ? key.path : storagePath + key;
    var file = fs.createWriteStream(destination)
      .on("error", cb)
      .on("close", cb);
    if (!key.bucket) {
      s3.getObject({ Key: path})
      .createReadStream()
      .pipe(file);
    } else {
      console.log('este es el path y el bucket', path, key.bucket);
      var newS3 = new AWS.S3({ params: { Bucket: key.bucket } });
      console.log('este es el viejo S3', s3);
      console.log('este es el objeto de s3', newS3);
      newS3.getObject({ Key: path })
      .createReadStream()
      .pipe(file);
    }

  }

  function clean(cb) {

    s3.listObjects({ Prefix: storagePath }, function(err, data){

      if (err || !data.Contents || !data.Contents.length) {
        return cb(err);
      }

      var objects = data.Contents.map(function(obj) {
        return { Key: obj.Key };
      });

      deleteObjects(objects, !!data.IsTruncated, cb);

    });

  }

  function deleteObjects(objects, truncated, cb) {

    s3.deleteObjects({ Delete: { Objects: objects } }, function(err, data){

      if (err) {
        return cb(err);
      }

      if (truncated) {
        return clean(cb);
      }

      return cb(null);

    });

  }

  // TODO make this more configurable
  function getURL(id) {
    return "https://s3.amazonaws.com/" + bucket + "/" + storagePath + "video/" + id + ".mp4";
  }

  return {
    upload: upload,
    download: download,
    getURL: getURL,
    clean: clean
  };

};
