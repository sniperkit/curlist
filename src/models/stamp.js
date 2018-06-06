const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');

const Stamp = sequelize.define('Stamp', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  number: Sequelize.INTEGER,
  name: Sequelize.STRING,
  stamp: Sequelize.STRING,
  user_id: Sequelize.INTEGER,
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  }
}, {
  //freezeTableName: true,
  //createdAt: 'created_at',
  updatedAt: false,
  //tableName: 'stamps'
});

Stamp.findLast = async function() {
  return await Stamp.findOne({
    order: [['id', 'DESC']]
  });
};

Stamp.prototype.generateName = function() {
  return this.id ? this.id : 1;
}

module.exports = Stamp;
