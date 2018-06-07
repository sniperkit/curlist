const urijs = require('urijs');
const _ = require('lodash');

exports.build = function(str, data) {
  var uri = new urijs(str || '');
  var search = uri.search(true);
  uri.search(_.extend(search, data));
  return uri.normalizeQuery().toString();
}

/**
 * url to domain
 */
module.exports.urlToDomain = function(url) {

  if (!url) {
    return;
  }

  url = url.replace(/((http|https):\/\/)?(www.)?/, '');

  if (url) {
    url = url.toLowerCase();
  }

  if (!url.match('http')) {
    url = 'http://' + url;
  }

  url = new urijs(url).hostname();
  url = url.replace(/(www.)?/, '');

  return url;
}

