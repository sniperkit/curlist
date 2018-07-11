const _ = require('lodash');
const config = require('config');
const Promise = require('bluebird');
Promise.config({
  warnings: false
})

const queue = require('./src/clients/queue');
const logger = require('./src/clients/logger');
const wtj = require('./src/integrations/wtj');

require('./src/listeners/es');
require('./src/listeners/changelog');

const Item = require('./src/models/item');
const elasticitems = require('./src/clients/elasticitems')

queue.process('wtj', process.env.WTJ_CONCURRENCY || 1, async function(job, done) {

  console.log(job.data);

  // it should get from job.data.domain
  var item = await Item.findById(job.data.id);

  console.log(item.json);

  if (!item) {
    return done('error: not found');
  }

  //wtj.domain(item.json.domain)
  wtj.domain(item.json.domain)
  .timeout(15000)
  .then(async result => {
    logger.info(result);

    // should make a proper join here
    var newJson = Object.assign(_.clone(item.json), _.pick(result, ['meta_title', 'meta_description', 'meta_keywords']))
    item.json = newJson;

    //await item.addData(_.pick(result, ['meta_title', 'meta_description', 'meta_keywords']))

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
