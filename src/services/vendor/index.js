'use strict';

const service = require('feathers-sequelize');
const vendor = require('./vendor-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: vendor(app.get('sequelize'), app),
    paginate: {
      default: 25,
      max: 100
    }
  };

  // Initialize our service with any options it requires
  app.use('/vendors', service(options));

  // Get our initialize service to that we can bind hooks
  const vendorService = app.service('/vendors');

  // Set up our before hooks
  vendorService.before(hooks.before);

  // Set up our after hooks
  vendorService.after(hooks.after);
};
