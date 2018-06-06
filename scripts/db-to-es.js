const _ = require('lodash');
const Promise = require('bluebird');
Promise.config({
  warnings: false
})

const JSONStream = require('JSONStream')
const elasticbulk = require('elasticbulk')
const through2 = require('through2')
const config = require('config');
const service = require('./../src/services/service');
const Item = require('./../src/models/item');

var i = 0;

var schema = _.chain(config.get('item_schema')).pickBy(v => {
  return v.type === 'array';
}).mapValues((v, k) => {
  return {
    type: 'string',
    index: 'not_analyzed'
  }
}).value()

schema.id = {
  type: 'string'
}

schema.stamps = {
  type: 'string',
  index: 'not_analyzed'
}

console.log(schema);

(async function() {

  var items = await Item.findAll({
    //raw: true
    order: [
      ['id', 'DESC']
    ]
  });

  var data = _.map(items, v => {
    //console.log(v.getElasticData());
    return v.getElasticData();
    //return module.exports.processItemForSearch(v.getItem());
  });

  elasticbulk.import(data, {
    index: process.env.INDEX || config.get('elasticsearch.index'),
    type: process.env.TYPE || config.get('elasticsearch.type'),
    limit: process.env.LIMIT,
    debug: true,
    host: process.env.ES_HOST || config.get('elasticsearch.host'),
  }, schema)
  .then(function(res) {
    //console.log(i);
    process.exit()
  })
})();
