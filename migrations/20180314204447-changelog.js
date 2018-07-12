'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('changelogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      item_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      is_first: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      json: {
        type: Sequelize.JSON
      },
      old_json: {
        allowNull: true,
        type: Sequelize.JSON
      },
      is_change: {
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('changelogs');
  }
};
