'use strict';

const service = require('feathers-sequelize');
const product = require('./product-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: product(app.get('sequelize'), app),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/product', service(options));

  // Get our initialize service to that we can bind hooks
  const productService = app.service('/product');

  // Set up our before hooks
  productService.before(hooks.before);

  // Set up our after hooks
  productService.after(hooks.after);
};
