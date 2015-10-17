const tilenol = require('../index');
const path = require('path');
const fs = require('fs');

tilenol.slice({
  onTile: function (name, stdout, callback) {
    const writeStream = fs.createWriteStream(name);
    stdout.pipe(writeStream);
    stdout.on('end', callback);
  },
  path: 'image.jpeg'
}, function (err, count) {
  if (err) {
    return console.log('Error creating tiles: ' + err);
  }
  console.log('Completed, made %s tiles.', count);
});
