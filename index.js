const request = require('request');
const gm = require('gm');
const path = require('path');
const async = require('async');
const fs = require('fs');

module.exports = {
  slice: function(opts, callback) {
    opts = opts || {};
    const onTile = opts.onTile;
    const size = opts.size || 64;
    var count = 0;

    if (!onTile) {
      return callback('No onTile option called, so nothing will happen.');
    }

    const q = async.queue(function (task, callback) {
      const url = task.url;
      const ext = path.extname(url);
      const name = [path.basename(url, ext), task.size, task.x + 'x', task.y + 'y'].join('-') + ext;

      task.stream
        .crop(task.width, task.height, task.x, task.y)
        .stream(function (err, stdout) {
          if (err) {
            console.log(err);
            return callback(err);
          }

          onTile(name, stdout, callback);
        });
    }, 1);

    q.drain = function () {
      callback(null, count);
    };

    var stream;

    if (opts.url) {
      stream = request(opts.url);
    } else {
      stream = fs.createReadStream(opts.path);
    }

    gm(stream).size({ bufferStream: true }, function(err, s) {
      var x, y, w, h;
      for (y = 0; y < s.height; y += size) {
        for (x = 0; x < s.width; x += size) {
          w = Math.min(size, s.width - x);
          h = Math.min(size, s.height - y);

          q.push({
            stream: this,
            width: w,
            height: h,
            size: size,
            x: x,
            y: y,
            url: opts.url || opts.path
          });
        }
      }
      count = q.length();
    });
  }
};
