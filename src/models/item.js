const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');

module.exports = sequelize.define('Item', {
  test: Sequelize.STRING,
  json: Sequelize.JSON
}, {
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
