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

/*module.exports.isChange = function(json, old_json) {

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
}*/

module.exports.isFieldChange = function(val, old_val) {

  var is_change = false;

  var val = _.isString(val) ? val.replace(/\r/, '') : val;
  var old_val = _.isString(old_val) ? old_val.replace(/\r/, '') : old_val;

  // ignore undefined values
  if (val === undefined) {
    return;
  }

  if (
    (!old_val && !val) ||
    (!old_val && _.isArray(val) && !val.length)
  ) {
    // no is_change
  } else if (!_.isEqual(old_val, val)) {
    is_change = true;
  }

  return is_change;
}

module.exports.isChange = function(json, old_json) {
  var is_change = false;

  _.keys(json).forEach(k => {

    if (module.exports.isFieldChange(json[k], old_json[k])) {
      is_change = true;
    }
  })

  return is_change;
}
