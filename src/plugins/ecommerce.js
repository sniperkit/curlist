const Promise = require('bluebird');
const config = require('config');

const request = Promise.promisifyAll(require('request').defaults({
  baseUrl: config.get('plugins.ecommerce-crawler.url'),
  json: true,
}));

module.exports.domain = function(domain) {
  return request.getAsync({
    url: config.get('plugins.ecommerce-crawler.path') + '/' + domain,
  })
  .then(result => {
    return result.body;
  })
}
