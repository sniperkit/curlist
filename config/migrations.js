const config = require('config');

// it gets specific configuration based on config npm library
// and based on node environment
// this is required by sequelize
module.exports = {
  development: config.get('db'),
  test: config.get('db'),
  production: config.get('db')
}
