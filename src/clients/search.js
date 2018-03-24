const Item = require('./../models/item');
const _ = require('lodash');
const itemsjs = require('itemsjs');
const config = require('config');
const service = require('./../services/service');

module.exports.getClient = async function() {

  var search_conf = config.get('search');
  search_conf.aggregations = _.mapKeys(search_conf.aggregations, (v, k) => {

    if (!v.title) {
      v.title = _.startCase(k);
    }

    if (!v.field) {
      v.field = k;
    }

    if (!v.sort) {
      v.sort = '_count';
    }

    if (!v.size) {
      v.size = 10;
    }

    if (!v.type) {
      v.type = 'terms';
    }
    return v;
  })

  if (config.get('search_engine') === 'itemsjs') {

    // for large items base it takes long
    var data = await service.allItems();

    // it should also process items
    // for search
    return itemsjs(
      data,
      search_conf
    )
  } else {

    var client = require('elasticitems')({
      index: config.get('elasticsearch.index'),
      type: config.get('elasticsearch.type')
    }, search_conf);

    var search = client.search;

    client.search = function(queries) {
      return search(queries)
      .then(result => {
        result.timings = {};
        return result;
      })
    }

    var facet = client.aggregation;

    client.aggregation = function(data) {
      var data = {
        field: data.name,
        sort: data.sort || '_terms',
        per_page: data.per_page,
        order: data.order || 'asc',
        size: 100000,
        aggregation_query: data.query
      }
      return facet(data)
    }

    return client;
  }
}
