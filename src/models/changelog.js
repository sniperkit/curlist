const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');
const Item = require('./item');
const User = require('./user');
const _ = require('lodash');

const Changelog = sequelize.define('Changelog', {
  json: Sequelize.JSON,
  old_json: Sequelize.JSON,
  is_first: Sequelize.BOOLEAN,
  is_change: Sequelize.BOOLEAN,
  created_at: {
    type: Sequelize.DATE,
    field: 'created_at'
  },
  updated_at: {
    type: Sequelize.DATE,
    field: 'updated_at'
  },
  item_id: Sequelize.INTEGER
}, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'changelogs'
});

Changelog.findLast = async function(ids) {
  return await Changelog.findOne({
    order: [
      ['id', 'DESC']
    ]
  });
}

Changelog.prototype.getDisplayedField = function(field, item_field) {

  var values = '';

  if (this.dataValues[field] && this.dataValues[field][item_field]) {
    values = this.dataValues[field][item_field]
  }

  if (values && _.isArray(values)) {
    //console.log(values);
    return values.join(',');
    return _.sortBy(values).join(',');
  }

  return values;
}

Changelog.belongsTo(Item, {
  foreignKey: 'item_id', targetKey: 'id'
});

Changelog.belongsTo(User, {
  foreignKey: 'user_id', targetKey: 'id'
});

module.exports = Changelog;
