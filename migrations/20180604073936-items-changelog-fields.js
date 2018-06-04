'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('Items', 'last_user_id', {
      allowNull: true,
      type: Sequelize.INTEGER
    })

    await queryInterface.addColumn('Items', 'last_activity', {
      allowNull: true,
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
