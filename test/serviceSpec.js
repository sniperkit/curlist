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

describe('user service', function() {

  before(async function() {
    //await Item.destroy({ truncate : true })
    //await Changelog.destroy({ truncate : true })

    // recreating fresh db
    await sequelize.sync({
      force: true,
      alter: true
    });

    var user = await User.create({
      email: 'joe.doe@mailinator.com'
    })
  })

  it('should process item for db', async function test() {
    var item = service.processItemForDB({
      tags: 'a,b,c,d,d,d',
      tags2: '',
      tags3: null,
      tags4: undefined,
      genres: ''
    }, {
      tags: {
        type: 'array'
      }, tags2: {
        type: 'array'
      }, tags3: {
        type: 'array'
      }, tags4: {
        type: 'array'
      }, genres: {
        type: 'array'
      }, description: {
        type: 'text'
      }
    })

    assert.deepEqual(['a', 'b', 'c', 'd'], item.tags)
    assert.deepEqual([], item.tags2)
    assert.deepEqual([], item.tags3)
    assert.deepEqual(undefined, item.tags4)
    assert.deepEqual([], item.genres)
  })

  it('should add item', async function test() {
    assert.equal(0, await Item.count())
    assert.equal(0, await Changelog.count())
    var item = await service.addItem({
      name: 'Spartacus',
      country: 'USA',
      tags: ['a', 'b']
    }, 1)

    var changelog = await Changelog.findLast();

    assert.equal(1, await Item.count())
    assert.equal(1, await Changelog.count())
    assert.equal(1, await changelog.id)
    assert.equal(true, await changelog.is_change)

    assert.equal(1, item.id)
    assert.equal('Spartacus', item.json.name)
    assert.deepEqual(['a', 'b'], item.json.tags)
    assert.equal(1, item.added_by_user_id)

    var user = await item.getAddedByUser()
    assert.equal(1, user.id);
    var user = await item.getEditedByUser()
    assert.equal(null, user);
  })

  it('should edit item', async function test() {

    assert.equal(1, await Item.count())
    assert.equal(1, await Changelog.count())
    var item = await service.editItem(1, {
      name: 'Spartacus II',
      empty1: null,
      empty2: null,
      actors: ['actor'],
      tags: ['a', 'b', 'c']
    }, 1)

    var changelog = await Changelog.findLast();

    assert.equal(1, await Item.count())
    assert.equal(2, await Changelog.count())

    assert.equal(2, await changelog.id)
    assert.equal(true, await changelog.is_change)

    assert.equal('Spartacus II', item.json.name)
    assert.deepEqual(['a', 'b', 'c'], item.json.tags)
    var user = await item.getEditedByUser()
    assert.equal(1, user.id);
  });

  it('should do anything if new and old values are the same', async function test() {

    var item = await service.editItem(1, {
      name: 'Spartacus II',
      empty1: [],
      empty2: '',
      actors: undefined,
      tags: ['a', 'b', 'c']
    })

    var changelog = await Changelog.findLast();
    assert.equal(false, await changelog.is_change)

    assert.equal(1, await Item.count())
    assert.equal(3, await Changelog.count())
  });

  it('should edit item with empty value', async function test() {

    var item = await service.editItem(1, {
      country: '',
      tags: []
    })

    var changelog = await Changelog.findLast();

    // tags changed
    assert.equal(true, await changelog.is_change)

    assert.equal('Spartacus II', item.json.name)
    assert.equal('', item.json.country)
    assert.deepEqual([], item.json.tags)

    assert.equal(1, await Item.count())
    assert.equal(4, await Changelog.count())

    // experimental method getItem()
    assert.equal('Spartacus II', item.getItem().name)
    assert.equal('', item.getItem().country)
    assert.equal(1, item.getItem().id)
    //assert.deepEqual([], item.json.tags)
  });

  it('should delete item', async function test() {

    var item = await service.deleteItem(1)

    assert.equal(0, await Item.count())
    assert.equal(4, await Changelog.count())
  });
})
