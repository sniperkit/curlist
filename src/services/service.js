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
    user_id: user_id,
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
    }
  })

  //body.tags = body.tags.split(',');
  //body.actors = body.actors.split(',');
  return body;
}

module.exports.editItem = async function(id, body, user_id) {

  var item = await Item.findById(id);
  var json = _.merge(item.json, body);

  await Item.update({
    json: json
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
