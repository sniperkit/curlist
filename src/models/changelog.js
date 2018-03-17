const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');
const Item = require('./item');
const User = require('./user');

const Changelog = sequelize.define('Changelog', {
  json: Sequelize.JSON,
  old_json: Sequelize.JSON,
  is_first: Sequelize.BOOLEAN,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  item_id: Sequelize.INTEGER
}, {
});

Changelog.belongsTo(Item, {
  foreignKey: 'item_id', targetKey: 'id'
});

Changelog.belongsTo(User, {
  foreignKey: 'user_id', targetKey: 'id'
});

module.exports = Changelog;
