const config = require('config');
const environment = process.env.NODE_ENV || 'development';

// it gets specific configuration based on config npm library
// and based on node environment
// this is required by sequelize
module.exports = {
  [environment]: config.get('db')
}
