'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('Items', 'stamps', {
      allowNull: true,
      type: Sequelize.TEXT
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
