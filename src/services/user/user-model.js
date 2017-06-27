'use strict';

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const User = sequelize.define('User', {
    id : {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING
    },
    lastname: {
      type: Sequelize.STRING
    },
    roles: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ['admin', 'editor', 'reader', 'user']
    }
  }, {
    define: { timestamps: false }
  });

  return User;
};
