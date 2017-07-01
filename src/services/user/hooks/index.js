'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  get: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  create: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    }),
    auth.hashPassword()
  ],
  update: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    }),
    auth.hashPassword()
  ],
  patch: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    }),
    auth.hashPassword()
  ],
  remove: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ]
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
