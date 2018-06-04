const Sequelize = require('sequelize');
const Op = Sequelize.Op
const sequelize = require('./../clients/sequelize');
const User = require('./user');
const _ = require('lodash');
const emitter = require('./../clients/emitter');

const Item = sequelize.define('Item', {
  json: Sequelize.JSON,
  main_field: {
    type: Sequelize.STRING
  },
  added_by_user_id: {
    type: Sequelize.INTEGER
  },
  edited_by_user_id: {
    type: Sequelize.INTEGER
  },
  last_activity: {
    type: Sequelize.STRING
  },
  last_user_id: {
    type: Sequelize.INTEGER
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE
}, {
  paranoid: true,
  //freezeTableName: false,
});

Item.prototype.getItem = function() {
  return _.merge(this.json, {
    id: this.id
  })
}

Item.prototype.getElasticData = function() {

  return this.json;
  //return psqlToEsHelper.convertItem(this.dataValues);
}

Item.findByIds = async function(ids) {
  return await Item.findAll({
    where: {
      id: {
        [Op.in]: ids
      }
    }
  });
}

Item.prototype.getExportData = function() {

  return _.mapValues(this.json, function(o) {
    if (_.isArray(o)) {
      return o.join(',');
    }

    return o;
  });
}

Item.prototype.getChangelogData = function(which) {
  //var fields = config.get('changelog.fields');

  if (which === 'old') {

    //return _.pick(this._previousDataValues, fields);
    return this._previousDataValues['json'];
  }

  return this.dataValues['json'];
  //return _.pick(this.dataValues, fields);
}

/*Item.prototype.overrideJsonData = function(body) {
  Object.assign(this.json, body);
}*/

Item.hook('afterUpdate', async (item, options) => {
  //console.log('after update');
  await emitter.emitAsync('item.updated', item);
})

Item.hook('afterCreate', async (item, options) => {
  //console.log('after create');
  await emitter.emitAsync('item.added', item);
})

Item.hook('afterUpsert', async (item, options) => {
  //console.log('after upsert');
})

Item.hook('afterDestroy', async (item, options) => {
  //console.log('after destroy');
  await emitter.emitAsync('item.removed', item);
})

Item.belongsTo(User, {
  foreignKey: 'added_by_user_id', targetKey: 'id', as: 'addedByUser'
});

Item.belongsTo(User, {
  foreignKey: 'edited_by_user_id', targetKey: 'id', as: 'editedByUser'
});

module.exports = Item;
