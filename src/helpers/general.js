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

/*module.exports.isFieldChange = function(val, old_val) {
}*/

module.exports.isChange = function(json, old_json) {

  var changes = false;

  _.keys(json).forEach(k => {

    // ignore undefined values
    if (json[k] === undefined) {
      // it works like "continue" here
      return;
    }

    if (
      (!old_json[k] && !json[k]) ||
      (!old_json[k] && _.isArray(json[k]) && !json[k].length)
    ) {
      // no changes
    } else if (!_.isEqual(old_json[k], json[k])) {
      changes = true;
    }
  })

  return changes;
}
