'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('Stamps', 'user_id', {
      allowNull: true,
      type: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
