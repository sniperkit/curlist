const urijs = require('urijs');
const _ = require('lodash');

exports.build = function(str, data) {
  var url = new urijs(str || '');
  var search = url.search(true);
  url.search(_.extend(search, data));
  return url.search();
}

exports.normalizeUrl = function(url) {

  if (!url.match('http')) {
    url = 'http://' + url;
  }

  url = new urijs(url).hostname();
  url = url.replace(/(www.)?/, '');

  return url;
}
