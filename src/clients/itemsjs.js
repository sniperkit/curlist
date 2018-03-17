const Item = require('./../models/item');
const _ = require('lodash');
const itemsjs = require('itemsjs');
const config = require('config');

module.exports = async function(done) {

  // it should goes to service and be get by cache(?)
  var items = await Item.findAll({
    order: [
      ['id', 'DESC']
    ]
  })

  var data = _.map(items, v => {
    return Object.assign({
      id: v.id
    }, v.json);
  });

  client = itemsjs(
    data,
    config.get('search')
  )

  done(client);
}
