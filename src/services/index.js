'use strict';
const vendor = require('./vendor');
const product = require('./product');
const entry = require('./entry');
const authentication = require('./authentication');
const user = require('./user');
const Sequelize = require('sequelize');
module.exports = function() {
  const app = this;

  const sequelize = new Sequelize(app.get('mysql'), {
    dialect: 'mysql',
    logging: console.log
  });
  app.set('sequelize', sequelize);

  app.configure(authentication);

  app.configure(user);
  app.configure(vendor);
  app.configure(product);
  app.configure(entry);

  // Associate all of our models
  Object.keys(sequelize.models)
    .map(name => sequelize.models[name])
    .filter(model => model.associate !== undefined)
    .forEach(model => model.associate());

  sequelize.sync();

};
