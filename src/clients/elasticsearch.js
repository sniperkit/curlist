const elasticsearch = require('elasticsearch');
const Promise = require('bluebird');
const config = require('config');

module.exports = new elasticsearch.Client({
  host: config.get('elasticsearch.host'),
  defer: function () {
    return Promise.defer();
  }
});
