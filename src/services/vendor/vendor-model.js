'use strict';

// vendor-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Vendor = sequelize.define('Vendor', {
		id : {
      type: Sequelize.INTEGER(11),
      limit: 11,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    }
  }, {
    define: { timestamps: false }
  });
  return Vendor;
};
