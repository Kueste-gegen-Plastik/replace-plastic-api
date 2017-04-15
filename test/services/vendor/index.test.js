'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('vendor service', function() {
  it('registered the vendors service', () => {
    assert.ok(app.service('vendors'));
  });
});
