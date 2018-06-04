const emitter = require('./../clients/emitter');
const Promise = require('bluebird')
const Changelog = require('./../models/changelog');
const helper = require('./../helpers/general');
const logger = require('./../clients/logger');

emitter.on('item.added', async function(item) {

  await Changelog.create({
    item_id: item.id,
    user_id: item.last_user_id,
    source: item.last_activity,
    is_change: true,
    is_first: true,
    json: item.getChangelogData()
  })
})

emitter.on('item.updated', async function(item) {

  //console.log(item.getChangelogData());
  //console.log(item.getChangelogData('old'));

  await Changelog.create({
    item_id: item.id,
    user_id: item.last_user_id,
    source: item.last_activity,
    is_change: helper.isChange(
      item.getChangelogData(),
      item.getChangelogData('old')
    ),
    is_first: false,
    old_json: item.getChangelogData('old'),
    json: item.getChangelogData()
  })
})

emitter.on('item.removed', function(item) {
  logger.info('item "' + item.id + '" has been deleted')
})
