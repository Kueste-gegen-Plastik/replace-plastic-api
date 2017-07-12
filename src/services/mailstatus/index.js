'use strict';

const hooks = require('./hooks');

module.exports = function(){

  const app = this;

  // Initialize our service with any options it requires
  app.use('/mailstatus', {
    get(active) {
      const status = parseInt(active, 10) === 1;
      app.get('mailEmitter').emit('mailstatus', status);
      return Promise.resolve({ status });
    }
  });

  // Get our initialize service to that we can bind hooks
  const mailstatusService = app.service('/mailstatus');
  // Set up our before hooks
  mailstatusService.before(hooks.before);
  // Set up our after hooks
  mailstatusService.after(hooks.after);

};
