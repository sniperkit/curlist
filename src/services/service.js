const Item = require('./../models/item');
const Changelog = require('./../models/changelog');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op

module.exports.findById  = async function(id) {
  var item = await Item.findById(id);

  return _.merge(item.json, {
    id: item.id
  })
}

module.exports.addItem = async function(body, user_id) {

  var item = await Item.create({
    json: body,
    added_by_user_id: user_id
  })

  // should add item to changelog automatically
  await Changelog.create({
    user_id: user_id,
    item_id: item.id,
    json: body
  })

  return item;
}

/**
 * get json data from db and make additional preprocessing
 * for itemsjs or elasticsearch
 * this function content probably should be defined in simplier place
 * as it will be configured per application
 */
module.exports.processItemForSearch = async function(json) {
}

/**
 * get raw data from web form or csv and make preprocessing
 * for db (sqlite, postgre, etc). i.e. change comma delimited
 * tags into array by looking into provided schema
 */
module.exports.processItemForDB = function(body, schema) {

  body = body || {};
  schema = schema || {};

  _.keys(schema).forEach(k => {
    if (schema[k].type === 'array' && _.isString(body[k])) {
      body[k] = _.chain(body[k])
        .split(',')
        .filter(v => {
          return !!v;
        })
        .uniq()
        .value();
    } else if (schema[k].type === 'array' && !body[k]) {
      body[k] = [];
    }
  })

  return body;
}

module.exports.deleteItem = async function(id) {
  var item = await Item.destroy({
    where: {
      [Op.and]: {
        id: id
      }
    }
  });
}

module.exports.editItem = async function(id, body, user_id) {

  var item = await Item.findById(id);

  // check if there are some changes
  // if not then return
  var changes = false;

  _.keys(body).forEach(k => {

    //!item.json[k] && _.isArray(body[k]) && !body[k].length => no changes
    //!item.json[k] && !body[k] => no changes

    if (
      (!item.json[k] && !body[k]) ||
      (!item.json[k] && _.isArray(body[k]) && !body[k].length)
    ) {
      // no changes
    } else if (!_.isEqual(item.json[k], body[k])) {
      changes = true;
    }
  })

  if (!changes) {
    return item;
  }

  var json = _.merge(item.json, body);

  _.keys(body).forEach(k => {
    if (_.isArray(body[k])) {
      json[k] = body[k];
    }
  })

  await Item.update({
    json: json,
    edited_by_user_id: user_id
  }, {
    where: {
      [Op.and]: {
        id: id
      }
    }
  });

  var item = await Item.findById(id);

  var old_changelog = await Changelog.find({
    order: [
      ['id', 'DESC']
    ], where: {
      [Op.and]: {
        item_id: id
      }
    }
  });

  // probably it should goes to instance hook
  // so then item goes to changelog automatically
  // and we don't worry about sync
  await Changelog.create({
    user_id: user_id,
    item_id: id,
    is_first: false,
    old_json: old_changelog.json,
    json: item.json
  })

  return item;
}

module.exports.allItems = async function() {

  var items = await Item.findAll({
    //raw: true
    order: [
      ['id', 'DESC']
    ]
  });

  var data = _.map(items, v => {
    return Object.assign({
      id: v.id
    }, v.json);
  });

  return data;
}
