var User = require('./../src/models/user');
var Item = require('./../src/models/item');
var service = require('./../src/services/service');
const Promise = require('bluebird');
const config = require('config');

(async function() {

  var data = require(process.env.IMPORT_FILE || './../data/imdb_full.json');

  // make it with transaction ?!

  await Promise.all(data)
  .map(json => {

    delete json.id;

    var body = service.processItemForDB(json, config.get('item_schema'));
    return service.addItem(body);
  }, {concurrency: 1})

  console.log('finished');
  process.exit();
})()
