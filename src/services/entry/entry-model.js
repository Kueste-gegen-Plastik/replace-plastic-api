'use strict';

// posts-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize, app) {

  const Entry = sequelize.define('Entry', {
		id : {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    barcode: {
      type: Sequelize.STRING,
      allowNull: false
    },
		email: {
      type: Sequelize.STRING
    },
		name: {
      type: Sequelize.STRING
    },
		firstname: {
      type: Sequelize.STRING
    },
		zip: {
      type: Sequelize.STRING(6)
    },
		sent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      default: false
    },
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    }
  }, {
    classMethods: {
      associate() {
         Entry.belongsTo(sequelize.models.Product);
      },
    }
  });

  return Entry;
};
