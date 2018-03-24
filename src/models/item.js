const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');
const User = require('./user');
const _ = require('lodash');

const Item = sequelize.define('Item', {
  json: Sequelize.JSON,
  added_by_user_id: {
    type: Sequelize.INTEGER
  },
  edited_by_user_id: {
    type: Sequelize.INTEGER
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE
}, {
  paranoid: true,
  //underscored: true,
  instanceMethods: {
    toJson: function () {
      return {
        name: 'aa'
      }
      //delete this.dataValues.password;
      //return JSON.stringify(this.dataValues);
    }
  }
});

Item.prototype.getItem = function() {
  return _.merge(this.json, {
    id: this.id
  })
}

Item.belongsTo(User, {
  foreignKey: 'added_by_user_id', targetKey: 'id', as: 'addedByUser'
});

Item.belongsTo(User, {
  foreignKey: 'edited_by_user_id', targetKey: 'id', as: 'editedByUser'
});

module.exports = Item;
