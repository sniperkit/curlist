'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING
      },
      picture: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      is_enabled: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      is_admin: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      google: {
        allowNull: true,
        type: Sequelize.JSON
      },
      facebook: {
        allowNull: true,
        type: Sequelize.JSON
      },
      linkedin: {
        allowNull: true,
        type: Sequelize.JSON
      },
      github: {
        allowNull: true,
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
