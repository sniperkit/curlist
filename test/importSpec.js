'use strict';

var assert = require('assert');
const service = require('./../src/services/service');
const Item = require('./../src/models/item');
const _ = require('lodash');
const sequelize = require('./../src/clients/sequelize');


if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('data tools', function() {

  before(async function() {
    await sequelize.sync({
      force: true,
      alter: true
    });
  })

  it('simple import', async function test() {

    var result = await service.import([{
      domain: 'amazon.com',
      tags: ['camera']
    }, {
      domain: 'aliexpress.com',
      tags: ['china']
    }])

    assert.equal(result.stamp_name, '0001');
    assert.equal(result.created_count, 2);
    assert.equal(result.updated_count, 0);
    assert.equal(result.ignored_count, 0);

    var item = await Item.findById(1);
    assert.equal(item.json.domain, 'amazon.com');
    assert.deepEqual(item.json.tags, ['camera']);
    //assert.equal(item.stamps, '0001');

    var item = await Item.findById(2);
    assert.equal(item.json.domain, 'aliexpress.com');
    assert.deepEqual(item.json.tags, ['china']);
    //assert.equal(item.stamps, '0001');
  })

  it('simple import', async function test() {

    var result = await service.import([{
      domain: 'amazon.com',
      tags: ['camera', 'electronic']
    }, {
      domain: 'aliexpress.com',
    }, {
      tags: ['empty']
    }])

    assert.equal(result.stamp_name, '0002');
    assert.equal(result.created_count, 0);
    assert.equal(result.updated_count, 2);
    assert.equal(result.ignored_count, 1);

    var item = await Item.findById(1);
    assert.equal(item.main_field, 'amazon.com');
    assert.equal(item.json.domain, 'amazon.com');
    assert.deepEqual(item.json.tags, ['camera', 'electronic']);
    //assert.equal(item.stamps, '0001,0002');

    var item = await Item.findById(2);
    assert.equal(item.json.domain, 'aliexpress.com');
    //assert.equal(item.stamps, '0001,0002');

    var count = await Item.count();
    assert.equal(count, 2);
  })

  xit('simple import with soft deleted item', async function test() {

    await Item.destroy({
      where: {
        domain: 'aliexpress.com'
      }
    })

    var result = await service.import([{
      domain: 'aliexpress.com',
    }])

    assert.equal(result.stamp_name, 3);
    assert.equal(result.created_count, 0);
    assert.equal(result.updated_count, 1);
    assert.equal(result.ignored_count, 0);

    var item = await Item.findById(2);
    assert.equal(item, null);
    //assert.equal(item.domain, 'aliexpress.com');
    //assert.equal(item.stamps, '0001,0002');
    //assert.equal(item.source, 'google,gmail');
  })
});
