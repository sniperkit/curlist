const config = require('config');
const _ = require('lodash');

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

var client = require('elasticitems')({
  index: config.get('elasticsearch.index'),
  type: config.get('elasticsearch.type')
}, search_conf);

module.exports = client;
