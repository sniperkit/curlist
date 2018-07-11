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

const HOST = process.env.ES_HOST || config.get('elasticsearch.host')
const INDEX = process.env.INDEX || config.get('elasticsearch.index')
const TYPE = process.env.TYPE || config.get('elasticsearch.type')

const elasticsearch = require('elasticsearch');
const elastic = new elasticsearch.Client({
  host: HOST,
  defer: function () {
    return Promise.defer();
  }
});


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

// it should goes to item_schema
schema.other = {
  type: 'string',
  index: 'not_analyzed'
}

// native schema field
schema.stamps = {
  type: 'string',
  index: 'not_analyzed'
}

console.log(schema);

(async function() {

  // should be changed to streams
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

  console.log(INDEX);
  console.log(data.length);
  console.log(schema);

  elastic.indices.delete({
    index: INDEX
  })
  .catch(function(err) {
    // index already missing
  })
  .delay(1500)
  .then(function(res) {
    return elasticbulk.import(data, {
      index: INDEX,
      type: TYPE,
      limit: process.env.LIMIT,
      debug: true,
      host: HOST,
    }, schema)
  })
  .then(function(res) {
    //console.log(i);
    process.exit()
  })
})();
