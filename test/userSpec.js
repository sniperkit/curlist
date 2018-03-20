'use strict';

var assert = require('assert');
var service = require('./../src/services/user');
const User = require('./../src/models/user');
const _ = require('lodash');
const sequelize = require('./../src/clients/sequelize');

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Test environment requires NODE_ENV variable')
}

describe('user service', function() {

  before(async function() {
    //await User.destroy({ truncate : true })
    await sequelize.sync({
      force: true,
      alter: true
    });
  })

  var profile = {
    emails: [{
      value: 'matt@mailinator.com'
    }],
    id: 12345,
    name: {
      familyName: 'R',
      givenName: 'Mateusz'
    },
    displayName: 'Mateusz'
  }

  profile._json = _.clone(profile);

  it('should register google user', async function test() {

    assert.equal(0, await User.count())
    var user = await service.updateSocialUser('', '', profile, 'google')
    assert.equal(user.google.id, 12345)
    // first user is admin
    assert.equal(user.is_admin, true)
    assert.equal(user.email, 'matt@mailinator.com')
    assert.equal(user.name, 'Mateusz')
    assert.equal(user.username, 'Mateusz')
    assert.equal(user.first_name, 'Mateusz')
    assert.equal(user.last_name, 'R')
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
    assert.equal(user.is_admin, false)
    assert.equal(2, await User.count())
  });
})
