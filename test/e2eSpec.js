'use strict';
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('supertest'));
const should = require('should');
const app = require('./../server');
const PORT = 3050;
const sequelize = require('./../src/clients/sequelize');
const elastic = require('./../src/clients/elasticsearch');
const assert = require('assert');
const Item = require('./../src/models/item');
const Changelog = require('./../src/models/changelog');
const config = require('config');
const elasticbulk = require('elasticbulk');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('e2e tests', function() {

  before(async function() {

    await sequelize.sync({
      force: true,
      alter: true
    });

    await new Promise(resolve => {
      app.listen(PORT, () => {
        return resolve();
      })
    })

    await elastic.indices.delete({
      index: config.get('elasticsearch.index')
    })
    .catch(v => {
    })

    await elasticbulk.import([], {
      index: config.get('elasticsearch.index'),
      host: config.get('elasticsearch.host')
    })
    .delay(1000)
  })

  it('should be able import records', async function test() {

    assert.equal(0, await Item.count())
    assert.equal(0, await Changelog.count())

    var result = await request(app)
      .post('/import')
      .set('Content-Type',  'application/octet-stream')
      .attach('csv', './test/fixtures/import_file_1.csv')

    assert.equal(200, result.statusCode);
    assert.equal(2, await Item.count())
    assert.equal(2, await Changelog.count())

    var item = await Item.findById(1);
    assert.equal(1, item.id)
    assert.equal('domain1.com', item.json.domain)
    assert.equal('domain1.com', item.main_field)
    assert.equal('Drama', item.json.genre)
    assert.deepEqual(['a', 'b'], item.json.tags)

    var changelog = await Changelog.findById(1);
    assert.equal(1, changelog.id)
    console.log(changelog.json);
    assert.equal('domain1.com', changelog.json.domain)
    assert.equal(undefined, changelog.json.id)
    assert.equal(undefined, changelog.json._id)
  });

  it('should be able import records second time', async function test() {

    var result = await request(app)
      .post('/import')
      .set('Content-Type',  'application/octet-stream')
      .attach('csv', './test/fixtures/import_file_2.csv')

    assert.equal(200, result.statusCode);
    assert.equal(3, await Item.count())
    assert.equal(5, await Changelog.count())

    var item = await Item.findById(1);
    assert.equal(1, item.id)
    assert.equal('domain1.com', item.json.domain)
    assert.equal('domain1.com', item.main_field)
    assert.equal('Drama', item.json.genre)
    assert.equal(undefined, item.json.last_activity)
    assert.equal('import', item.last_activity)
    assert.deepEqual(['a', 'b', 'c'], item.json.tags)

    //console.log(item.json);

    var item = await Item.findById(2);
    assert.equal(2, item.id)
    assert.equal('domain2.com', item.json.domain)
    assert.equal('domain2.com', item.main_field)

    var item = await Item.findById(3);
    assert.equal(3, item.id)
    assert.deepEqual(['d'], item.json.tags)
    //console.log(item.json);
  });
})
