'use strict';

var assert = require('assert');
var service = require('./../src/services/service');
const Item = require('./../src/models/item');
const Changelog = require('./../src/models/changelog');
const _ = require('lodash');
const sequelize = require('./../src/clients/sequelize');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('user service', function() {

  before(async function() {
    //await Item.destroy({ truncate : true })
    //await Changelog.destroy({ truncate : true })

    // recreating fresh db
    await sequelize.sync({
      force: true,
      alter: true
    });
  })

  it('should process item for db', async function test() {
    var item = service.processItemForDB({
      tags: 'a,b,c,d,d,d',
      genres: ''
    }, {
      tags: {
        type: 'array'
      }, genres: {
        type: 'array'
      }, description: {
        type: 'text'
      }
    })

    assert.deepEqual(['a', 'b', 'c', 'd'], item.tags)
    assert.deepEqual([], item.genres)
  })

  it('should add item', async function test() {
    assert.equal(0, await Item.count())
    assert.equal(0, await Changelog.count())
    var item = await service.addItem({
      name: 'Spartacus',
      tags: ['a', 'b']
    })

    assert.equal(1, await Item.count())
    assert.equal(1, await Changelog.count())
    assert.equal(1, item.id)
    assert.equal('Spartacus', item.json.name)
    assert.deepEqual(['a', 'b'], item.json.tags)
  })

  it('should edit item', async function test() {

    assert.equal(1, await Item.count())
    assert.equal(1, await Changelog.count())
    var item = await service.editItem(1, {
      name: 'Spartacus II',
      tags: ['a', 'b', 'c']
    })

    assert.equal(1, await Item.count())
    assert.equal(2, await Changelog.count())
    assert.equal('Spartacus II', item.json.name)
    assert.deepEqual(['a', 'b', 'c'], item.json.tags)
  });
})
