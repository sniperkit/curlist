'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sessions', {
      sid: {
        allowNull: false,
        //autoIncrement: true,
        primaryKey: true,
        type: Sequelize.STRING
      },
      userId: Sequelize.STRING,
      expires: Sequelize.DATE,
      data: Sequelize.STRING(50000),
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('sessions');
  }
};
