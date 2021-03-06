'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const { unless, isProvider } = require('feathers-hooks-common')
const handleEan = require('./handleEan');

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
    unless(isProvider('server'),
      handleEan()
    )
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
