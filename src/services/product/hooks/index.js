'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const handleEan = require('./handleEan');
// 'admin', 'editor', 'reader'
exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    auth.restrictToRoles({
      roles: ['admin', 'editor', 'reader']
    })
  ],
  get: [
    handleEan()
  ],
  create: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  update: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  patch: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  remove: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.error = {
  all: [],
  find: [],
  get: [
  ],
  create: [],
  update: [],
  patch: [],
  remove: []
};
