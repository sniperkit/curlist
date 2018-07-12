const _ = require('lodash');
const config = require('config');
const Promise = require('bluebird');
Promise.config({
  warnings: false
})

const queue = require('./src/clients/queue');
const logger = require('./src/clients/logger');
const wtj = require('./src/plugins/wtj');
const tech = require('./src/plugins/tech');
const ecommerce = require('./src/plugins/ecommerce');

require('./src/listeners/es');
require('./src/listeners/changelog');

const Item = require('./src/models/item');
const elasticitems = require('./src/clients/elasticitems')

queue.process('wtj', process.env.WTJ_CONCURRENCY || 1, async function(job, done) {

  var item = await Item.findById(job.data.id);

  if (!item) {
    return done('error: not found');
  }

  wtj.domain(item.json.domain)
  .timeout(15000)
  .then(async result => {
    logger.info(result);

    item.overrideJsonData(_.pick(result, ['meta_title', 'meta_description', 'meta_keywords']))
    item.json.wtj_updated_at = new Date();
    item.last_activity = 'wtj';

    await item.save();

    done(null, 'success');
  })
  .catch(err => {
    //logger.error(item.domain);
    logger.error(err.message);
    //await item.save();
    return done('error: ' + err.message);
  })
});

queue.process('ecommerce-crawler', 1, async function(job, done) {

  var item = await Item.findById(job.data.id);

  if (!item) {
    return done('error: not found');
  }

  ecommerce.domain(item.json.domain)
  .timeout(30000)
  .then(async result => {

    console.log(result);

    item.overrideJsonData(_.pick(result, ['phones']))
    item.last_activity = 'ecommerce-crawler';
    await item.save();

    done(null, 'success');
  })
  .catch(err => {
    console.log(item.domain);
    console.log(err.message);
    return done('error: ' + err.message);
  })
});

queue.process('tech-detector', 1, async function(job, done) {

  var item = await Item.findById(job.data.id);

  if (!item) {
    return done('error: not found');
  }

  tech.domain(item.json.domain)
  .delay(5000)
  .timeout(15000)
  .then(async result => {
    logger.info(result);

    item.overrideJsonData(result)
    item.json.tech_detector_updated_at = new Date();
    item.last_activity = 'tech-detector';

    await item.save();
    done(null, 'success');
  })
  .catch(err => {
    console.log(err.message);
    return done('error: ' + err.message);
  })
});
