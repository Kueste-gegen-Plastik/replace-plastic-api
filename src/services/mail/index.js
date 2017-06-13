'use strict';

const service = require('feathers-sequelize');
const mail = require('./mail-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: mail(app.get('sequelize'), app),
    paginate: {
      default: 25,
      max: 100
    }
  };

  // Initialize our service with any options it requires
  app.use('/mails', service(options));

  // Get our initialize service to that we can bind hooks
  const mailService = app.service('/mails');

  // Set up our before hooks
  mailService.before(hooks.before);

  // Set up our after hooks
  mailService.after(hooks.after);
};
