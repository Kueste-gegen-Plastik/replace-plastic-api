'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const queryEan = require('./queryEan.js');
const createMail = require('./createMail.js');

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    }),
    function(hook) {
        let sequelize = hook.app.get('sequelize');
        hook.params.sequelize = {
            include: [sequelize.models.Product]
        }
    }
  ],
  get: [
    auth.restrictToRoles({
      roles: ['admin', 'editor']
    })
  ],
  create: [
    queryEan(),
    createMail()
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
