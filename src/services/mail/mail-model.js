'use strict';

// mail-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize, app) {

  const Mail = sequelize.define('Mail', {
		id : {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
		sent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      default: false
    },
		reminded: {
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
      associate(model) {
         Mail.belongsTo(sequelize.models.Product, { as : 'product', targetKey: 'id' });
         Mail.belongsTo(sequelize.models.Vendor, { as : 'vendor', targetKey: 'id' });
      },
    }
  });


  return Mail;
};
