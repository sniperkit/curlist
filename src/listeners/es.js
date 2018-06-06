const emitter = require('./../clients/emitter');
const Promise = require('bluebird')
const logger = require('./../clients/logger');
const elasticitems = require('./../clients/elasticitems');

emitter.on('item.added', function(item) {

  logger.info('item "' + item.id + '" has been added')

  return elasticitems.add(item.getElasticData(), {
    refresh: true
  });
})

emitter.on('item.updated', async function(item) {

  logger.info('item "' + item.id + '" has been updated')
  await elasticitems.partialUpdate(item.id, item.getElasticData(), {
    refresh: true
  });
})

emitter.on('item.removed', async function(item) {

  logger.info('item "' + item.id + '" has been deleted')
  await elasticitems.delete(item.id, {
    refresh: true
  });
})
