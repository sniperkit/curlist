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

  var item = await Item.findById(job.data.id);

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
    //console.log(item.json);

    //item.saveWtjData(result);
    //item.last_user_id = job.data.body.last_user_id;
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
