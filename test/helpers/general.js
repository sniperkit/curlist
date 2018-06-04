'use strict';

const assert = require('assert');
const helper = require('./../../src/helpers/general');

describe('general', function() {

  it('check isChange function', function test() {

    var is_change = helper.isChange({
      a: 5
    }, {
      a: 10
    });

    assert.equal(true, is_change)

    var is_change = helper.isChange({
      a: 10
    }, {
      a: 10
    });

    assert.equal(false, is_change)

    var is_change = helper.isChange({
      a: ['a', 'b', 'c']
    }, {
      a: ['a', 'b', 'c']
    });

    assert.equal(false, is_change)

    var is_change = helper.isChange({
      a: ['a', 'b', 'c']
    }, {
      a: ['a', 'b']
    });

    assert.equal(true, is_change)

    var is_change = helper.isChange({
      a: ['a', 'b', 'c'],
      b: 'b'
    }, {
      a: ['a', 'b', 'b']
    });

    assert.equal(true, is_change)
  });

});
