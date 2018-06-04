'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Items', 'main_field', {
      allowNull: true,
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
