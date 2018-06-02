var _ = require('lodash');
var validator = require('validator');

//http://stackoverflow.com/questions/11059054/get-and-replace-the-last-number-on-a-string-with-javascript-or-jquery
exports.incrementName = function(string) {
  var output = string.replace(/\d+$/, function(s) {
    return +s+1;
  })
  return output === string ? (output + '1') : output
}

/**
 * split 13535,352352,32423 for array of ids
 */
module.exports.getIds = function(ids) {
  if (!ids) {
    return [];
  }

  return _.chain(ids)
  .split(',')
  .map(v => {
    return parseInt(v);
  })
  .value()
}
