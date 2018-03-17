var User = require('./../src/models/user');
var Item = require('./../src/models/item');
var service = require('./../src/services/service');
const Promise = require('bluebird');

(async function() {

  var data = require('./../data/imdb_full.json');

  // make it with transaction ?!

  await Promise.all(data)
  .map(json => {
    return service.addItem(json);
  }, {concurrency: 1})

  console.log('finished');
  process.exit();
})()
