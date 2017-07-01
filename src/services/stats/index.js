'use strict';

const hooks = require('./hooks');
const Promise = require('bluebird');

module.exports = function(){
  const app = this;

  app.use('/stats', {
    find() {
      const sequelize = app.get('sequelize');
      const models = ['Mail','Product','Entry','Vendor'];
      const retVal = {};
      return Promise.all(models.map(model => {
        return sequelize.models[model].count().then(res => {
          retVal[model] = res;
        });
      })).then((a, b) => {
        return retVal;
      });
    }
  });

  // Get our initialize service to that we can bind hooks
  const statsService = app.service('/mailstatus');
  // Set up our before hooks
  statsService.before(hooks.before);
  // Set up our after hooks
  statsService.after(hooks.after);


};
