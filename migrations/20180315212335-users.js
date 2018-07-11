'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
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
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      // full name
      name: {
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
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
