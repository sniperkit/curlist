const Promise = require('bluebird');
const config = require('config');
const request = Promise.promisifyAll(require('request').defaults({
  baseUrl: config.get('plugins.tech-detector.url'),
  json: true,
}));

module.exports.domain = function(domain) {
  return request.getAsync({
    url: config.get('plugins.tech-detector.path') + '/' + domain,
    qs: {
      shoprank: true
    }
  })
  .then(result => {
    return result.body;
  })
}
