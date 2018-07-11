'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      json: {
        type: Sequelize.JSON
      },
      edited_by_user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      added_by_user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      main_field: {
        allowNull: true,
        type: Sequelize.STRING
      },

      last_user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },

      last_activity: {
        allowNull: true,
        type: Sequelize.STRING
      },
      stamps: {
        allowNull: true,
        type: Sequelize.TEXT
      },

      email: {
        allowNull: true,
        type: Sequelize.STRING
      },

      domain: {
        allowNull: true,
        type: Sequelize.STRING
      },

      url: {
        allowNull: true,
        type: Sequelize.STRING
      },
      deletedAt: {
        allowNull: true,
        //defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('items');
  }
};
