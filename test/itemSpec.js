'use strict';

var assert = require('assert');
var service = require('./../src/services/service');
const Item = require('./../src/models/item');
const Changelog = require('./../src/models/changelog');
const User = require('./../src/models/user');
const listener = require('./../src/listeners/changelog');
const _ = require('lodash');
const sequelize = require('./../src/clients/sequelize');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('item', function() {

  before(async function() {
    // recreating fresh db
    await sequelize.sync({
      force: true,
      alter: true
    });

  })

  it('should process item for db', async function test() {

    var item = await Item.create({
      json: {
        domain: 'domain.com',
        b: 'b',
      }
    })

    assert.deepEqual(1, item.id);
    assert.deepEqual('domain.com', item.main_field);

    var item = await item.update({
      json: {
        domain: 'domain2.com',
        a: 'a'
      }
    })

    assert.deepEqual(1, item.id);
    assert.deepEqual('domain2.com', item.main_field);
  })

  xit('should override json data properly', async function test() {

    var item = await Item.build({
      json: {
        name: 'name',
        tags: ['a', 'b', 'c']
      }
    })

    assert.equal(item.json.name, 'name');
    assert.deepEqual(item.json.tags, ['a', 'b', 'c']);

    item.overrideJsonData({
      tags: ['a']
    })

    //console.log(item);

    assert.equal(item.json.name, 'name');
    assert.deepEqual(item.json.tags, ['a']);

    item.overrideJsonData({
      name: 'name2'
    })

    //console.log(item);
    assert.equal(item.json.name, 'name2');
    assert.deepEqual(item.json.tags, ['a']);
  })
})
