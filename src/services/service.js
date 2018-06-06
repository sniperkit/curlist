const Item = require('./../models/item');
const Changelog = require('./../models/changelog');
const Stamp = require('./../models/stamp');
const urlHelper = require('./../helpers/url');
const _ = require('lodash');
const Sequelize = require('sequelize');
const config = require('config');
const Op = Sequelize.Op
const functions = config.get('functions_path') ? require(config.get('functions_path')) : {};
const c2j = require('csvtojson')
const Promise = require('bluebird');

module.exports.findById  = async function(id) {
  var item = await Item.findById(id);

  return _.merge(item.json, {
    id: item.id
  })
}

/**
 * return json as promise
 */
module.exports.csvToJson = function(text) {

  return new Promise(function (resolve, reject) {
    c2j({
      noheader:false,
      delimiter: [',', ';']
    })
    .fromString(text)
    .on('json', (json) => {
    })
    .on('end_parsed', (json) => {
      return resolve(json);
    })
    .on('done', () => {
    })
  });
}

module.exports.import = async function(data, options) {

  var created_count = 0;
  var updated_count = 0;
  var ignored_count = 0;

  options = options || {};

  var main_field = config.get('general.main_field');

  if (!main_field) {
    throw new Error('Please define general.main_field in configuration yaml')
  }

  var stamp = await Stamp.findLast();

  var stamp_name = stamp ? stamp.id + 1 : 1;
  stamp_name = _.padStart(stamp_name, 4, '0');

  await Promise.all(data)
    .map(async body => {

      //console.log(body);

      // its going through initial processing
      //body = _.pick(body, config.get('import.fields'))
      //body.stamps = stamp_name;

      if (!body[main_field]) {
        ++ignored_count;
        return;
      }


      //var item = await Item.findByDomain(body.domain, {
      var item = await Item.findByMainField(body[main_field], {
        paranoid: false
      });

      //console.log(body);

      //body.last_activity = options.last_activity;
      //body.last_user_id = options.user_id;

      //if (body && body.domain) {
      if (body && body[main_field]) {
        if (!item) {
          ++created_count;
          await Item.create({
            json: body,
            last_activity: options.last_activity,
            last_user_id: options.user_id,
            stamps: stamp_name
          })
          .catch(err => {
            console.log('Catched error');
            console.log(err.message);
          })
        } else {
          ++updated_count;

          //item.last_activity = options.last_activity;
          //item.last_user_id = options.user_id;


          // stamps should be merged here
          item = await item.update({
            json: Object.assign(_.clone(item.json), body),
            last_activity: options.last_activity,
            last_user_id: options.user_id,
            stamps: item.addStamp(stamp_name)
            //edited_by_user_id: user_id
          });

          //item.importData(body);
          //item.save();
        }
      } else {
        ++ignored_count;
      }
    }, {
      concurrency: 1
    })

  await Stamp.create()

  return {
    created_count,
    updated_count,
    ignored_count,
    stamp_name
  }
}

/**
 * get json data from db and make additional preprocessing
 * for itemsjs or elasticsearch
 * this function content probably should be defined in simplier place
 * as it will be configured per application
 */
module.exports.processItemForSearch = function(json) {
  // the file should be configured in configuration
  // and be changeable for each environment
  //return require('./config/functions').processItemForSearch(json);
  if (functions.processItemForSearch) {
    json = functions.processItemForSearch(json);
  }

  return json
}

module.exports.processItemForDisplay = function(json) {
  if (functions.processItemForDisplay) {
    json = functions.processItemForDisplay(json);
  }

  return json
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
    if (schema[k].type === 'domain' && _.isString(body[k])) {
      body[k] = urlHelper.urlToDomain(body[k]);
    } else if (schema[k].type === 'array' && _.isString(body[k])) {
      body[k] = _.chain(body[k])
        .split(',')
        .filter(v => {
          return !!v;
        })
        .uniq()
        .value();
    } else if (schema[k].type === 'array' && !body[k] && body[k] !== undefined) {
      body[k] = [];
    }
  })

  /*if (functions.processItemForDB) {
    body = functions.processItemForDB(body);
  }*/

  return body;
}

module.exports.deleteItem = async function(id) {
  var item = await Item.destroy({
    where: {
      [Op.and]: {
        id: id
      }
    }, individualHooks: true
  });
}

module.exports.addItem = async function(body, user_id) {

  var item = await Item.create({
    json: body,
    added_by_user_id: user_id
  })

  return item;
}

module.exports.editItem = async function(id, body, user_id) {

  var item = await Item.findById(id);

  //item.overrideJsonData(body);

  // it should go to item public method
  var newJson = Object.assign(_.clone(item.json), body);

  item = await item.update({
    json: newJson,
    edited_by_user_id: user_id
  });

  return item;
}
