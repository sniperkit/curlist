const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');

module.exports = sequelize.define('Item', {
  json: Sequelize.JSON,
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
