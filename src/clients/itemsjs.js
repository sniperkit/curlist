const Item = require('./../models/item');
const _ = require('lodash');
const itemsjs = require('itemsjs');
const config = require('config');
const service = require('./../services/service');

module.exports.getClient = async function() {

  var data = await service.allItems();

  // it should also process items
  // for search
  return itemsjs(
    data,
    config.get('search')
  )
}
