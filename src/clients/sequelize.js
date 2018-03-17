const Sequelize = require('sequelize');
const Op = Sequelize.Op
const config = require('config');
const _ = require('lodash');

var sequelize;

if (config.get('db').url) {
  sequelize = new Sequelize(
    config.get('db.url'),
    _.clone(config.get('db'))
  );
} else {
  sequelize = new Sequelize(config.get('db'));
}

module.exports = sequelize;
