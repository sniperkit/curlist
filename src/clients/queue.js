const kue = require('kue')
const _ = require('lodash');
const Promise = require('bluebird');
const redis = require('redis')
const config = require('config');

var queue = kue.createQueue({
  prefix: 'q',
  redis: {
    createClientFactory: function(){
      return redis.createClient({
        port: config.get('redis.port'),
        host: config.get('redis.host')
      })
      //return redis.createClient('/var/run/redis/redis.sock')
    }
  }
})

var addJob = function(queue_name, data, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    var job = queue.create(queue_name, data)
    .removeOnComplete(true)
    .attempts(options.attempts || 1).backoff(true)
    .ttl((1000 * 60 * 15))
    .save( function(err){
      if (err) {
        console.log(err);
        return reject(err)
      }
      //console.log('Job:', job.id);
      return resolve(job.id)
    });
  });
}

/**
 * designed for streaming
 */
var addJobs = function(bulk, options) {
  return Promise.map(bulk, function(data) {
    //console.log(data);

    if (!options.job) {
      throw new Error('Job schema must be defined')
    }

    var job = _.mapValues(options.job, function(o) {
      return _.get(data, o)
    });

    return addJob(options.queue_name, job, options)
  }, {
    concurrency: options.concurrency
  })
}

var cleanJobs = async function(ids, options) {

  options = options || {};

  await Promise.all(ids)
  .map(id => {

    return new Promise(function(resolve, reject) {
      kue.Job.get(id, function( err, job ) {
        if (err) {
          return reject('Problem with deleting job');
        }

        job.remove( function() {
          console.log( 'removed ', job.id );
          return resolve(job.id);
        });
      });
    })
  }, {concurrency: options.concurrency || 30})
}

module.exports = queue;
module.exports.addJobs = addJobs;
module.exports.addJob = addJob;
module.exports.cleanJobs = cleanJobs;
