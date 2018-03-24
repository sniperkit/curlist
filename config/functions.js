const _ = require('lodash');
const helper = require('./../src/helpers/url')

/**
 * process item for search facets
 * i.e. create or modify field based on old ones
 */
module.exports.processItemForSearch = function(json) {
  return json;
}

/**
 * from raw body from user  into db
 * i.e. form -> db
 */
module.exports.processItemForDB = function(body) {
  return body;
}

/**
 * it process item for displaying in item view
 */
module.exports.processItemForDisplay = function(json) {
  return json;
}
