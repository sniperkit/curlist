const Promise = require('bluebird');
const config = require('config');
const request = Promise.promisifyAll(require('request').defaults({
  baseUrl: config.get('plugins.wtj.url'),
  json: true,
}));

module.exports.domain = function(domain) {
  return request.getAsync({
    url: config.get('plugins.wtj.path') + '/' + domain,
    qs: {
      //cart_detection: false
    }
  })
  .then(result => {
    return result.body;
  })
}
