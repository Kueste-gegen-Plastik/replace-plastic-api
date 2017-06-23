'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
  ],
  find: [
    function(hook) {
        let sequelize = hook.app.get('sequelize');
        // Get the Sequelize instance. In the generated application via:
        hook.params.sequelize = {
          include: [ {
              model: sequelize.models.Product,
              as: 'product'
            }, {
              model: sequelize.models.Vendor,
              as: 'vendor'
            } ]
        }
    }
  ],
  get: [],
  create: [],
  update: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  patch: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  remove: [
    auth.restrictToRoles({
      roles: ['admin']
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
