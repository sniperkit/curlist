const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');
const User = require('./user');

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

Item.belongsTo(User, {
  foreignKey: 'added_by_user_id', targetKey: 'id', as: 'addedByUser'
});

Item.belongsTo(User, {
  foreignKey: 'edited_by_user_id', targetKey: 'id', as: 'editedByUser'
});

module.exports = Item;
