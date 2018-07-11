const Sequelize = require('sequelize');
const sequelize = require('./../clients/sequelize');

module.exports = sequelize.define('User', {
  picture: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING
  },
  first_name: {
    type: Sequelize.STRING
  },
  last_name: {
    type: Sequelize.STRING
  },
  is_enabled: {
    type: Sequelize.BOOLEAN
  },
  is_admin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  google: {
    type: Sequelize.JSON
  },
  facebook: {
    type: Sequelize.JSON
  },
  linkedin: {
    type: Sequelize.JSON
  },
  github: {
    type: Sequelize.JSON
  },
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
}, {
  tableName: 'users',
  instanceMethods: {
  }
});
