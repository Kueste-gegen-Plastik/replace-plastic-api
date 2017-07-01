'use strict';
const mail = require('./mail');
const vendor = require('./vendor');
const product = require('./product');
const entry = require('./entry');
const mailstatus = require('./mailstatus');
const stats = require('./stats');
const authentication = require('./authentication');
const user = require('./user');
const Sequelize = require('sequelize');
module.exports = function() {
  const app = this;

  const sequelize = new Sequelize(app.get('mysql'), {
    dialect: 'mysql',
    // logging: console.log
  });
  app.set('sequelize', sequelize);

  app.configure(authentication);

  app.configure(user);
  app.configure(vendor);
  app.configure(product);
  app.configure(entry);
  app.configure(mail);
  app.configure(mailstatus);
  app.configure(stats);

  // associate all models
  Object.keys(sequelize.models)
    .map(name => sequelize.models[name])
    .filter(model => model.associate !== undefined)
    .forEach(model => model.associate());

  // models get synced here, not in the
  // model definitions because there wouldn't
  // be all relations available at initialization
  // time
  sequelize.sync();

};
