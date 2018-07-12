const nunjucks = require('nunjucks');
const _ = require('lodash')
const urlHelper = require('./../helpers/url');
const helper = require('./../helpers/general');
const moment = require('moment')
const jsdiff = require('diff');

/**
 * template engine
 */
module.exports = function(app, path, options) {

  var nunenv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path, options)
  )

  nunenv.express(app)

  nunenv
  .addFilter('debug', function(obj) {
    return JSON.stringify(obj, null, 2)
  })

  .addFilter('build', function(str, data) {
    return urlHelper.build(str, data);
  })

  .addGlobal('is_field_change', function(val, old_val) {
    return helper.isFieldChange(val, old_val);
  })

  .addFilter('intval', function(obj) {
    return parseInt(obj || 0, 10);
  })

  .addGlobal('in_array', function(element, array) {
    array = array || [];
    return array.indexOf(element) !== -1;
  })

  .addFilter('intersection', function(a, b) {
    return _.intersection(a, b)
  })

  .addFilter('stringify', function(json) {
    return JSON.stringify(json)
  })

  .addFilter('sortObject', function(array, field, order) {
    return _.chain(array)
    .cloneDeep()
    .map(function(val, key) {
      val.key = key
      return val
    })
    .sortBy([function(o) {
      if (order === 'asc') {
        return o[field]
      }
      return -o[field]
    }])
    .value();
  })

  .addFilter('slice', function(string, a, b) {
    if (_.isString(string) || _.isArray(string)) {
      return string.slice(a, b)
    }
    return string
  })

  .addFilter('split', function(string, delimiter) {
    if (!string) {
      return [];
    }
    return string.split(delimiter || ',')
  })

  .addFilter('shuffle', function(array) {
    return _.shuffle(array)
  })

  .addFilter('randomElement', function(array) {
    return array[Math.floor(Math.random() * array.length)];
  })

  .addFilter('join', function(array, delimiter) {
    if (!array || !_.isArray(array)) {
      return array;
    }

    return array.join(delimiter || ',');
  })

  .addGlobal('diff', function(a, b) {
    var diff = jsdiff.diffWords(a, b)
    return diff
  })

  .addFilter('ceil', function(str) {
    return Math.ceil(str)
  })

  .addFilter('date', function(obj, format) {
    format = format || 'DD-MM-YYYY h:mm a';

    if (_.isNumber(obj) && obj < 1516269007 * 10) {
      return moment.unix(obj).format(format);
    } else if (obj) {
      return moment(obj).format(format);
    }
  })

  .addFilter('dateFrom', function(obj, locales) {
    if (obj) {
      moment.locale('en')
      return moment(obj).fromNow();
    }
  })

  return nunenv
}
