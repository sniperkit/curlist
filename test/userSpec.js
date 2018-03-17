'use strict';

var assert = require('assert');
var service = require('./../src/services/user');
const User = require('./../src/models/user');
const _ = require('lodash');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('user service', function() {

  before(async function() {
    await User.destroy({ truncate : true })
  })

  var profile = {
    emails: [{
      value: 'matt@mailinator.com'
    }],
    id: 12345,
    displayName: 'Matt Rz'
  }

  profile._json = _.clone(profile);

  it('should register google user', async function test() {

    assert.equal(0, await User.count())
    var user = await service.updateSocialUser('', '', profile, 'google')
    assert.equal(user.google.id, 12345)
    assert.equal(user.email, 'matt@mailinator.com')
    assert.equal(1, await User.count())
  });

  it('should update google user', async function test() {

    var user = await service.updateSocialUser('', '', profile, 'google')
    assert.equal(user.google.id, 12345)
    assert.equal(user.email, 'matt@mailinator.com')
    assert.equal(1, await User.count())
  });

  it('should update google user without email', async function test() {

    var user = await service.updateSocialUser('', '', {
      id: 12345
    }, 'google')
    assert.equal(user.email, 'matt@mailinator.com')
    assert.equal(1, await User.count())
  });

  it('should register another google user without email', async function test() {

    var user = await service.updateSocialUser('', '', {
      id: 2468,
      _json: {
        id: 2468
      }
    }, 'google')
    assert.equal(user.google.id, 2468)
    assert.equal(2, await User.count())
  });
})
