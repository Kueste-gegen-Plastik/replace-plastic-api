'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: ['admin']
    })
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
  update: [],
  patch: [],
  remove: []
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
