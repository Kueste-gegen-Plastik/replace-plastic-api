'use strict';

// product-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Product = sequelize.define('Product', {
		id : {
      type: Sequelize.INTEGER(11),
      limit: 11,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
		barcode: {
      type: Sequelize.STRING,
      allowNull: false
    },
		asin: {
      type: Sequelize.STRING(45)
    },
		name: {
      type: Sequelize.STRING
    },
		detailname:  {
      type: Sequelize.STRING
    },
		vendor:  {
      type: Sequelize.STRING
    },
		maincat: {
      type: Sequelize.STRING(45)
    },
		subcat: {
      type: Sequelize.STRING(45)
    },
		maincatnum: {
      type: Sequelize.INTEGER(11)
    },
		subcatnum: {
      type: Sequelize.INTEGER(11)
    },
		contents:  {
      type: Sequelize.STRING
    },
		pack: {
      type: Sequelize.INTEGER(11)
    },
		origin: {
      type: Sequelize.STRING(45)
    },
		descr:  {
      type: Sequelize.STRING
    },
		name_en: {
      type: Sequelize.STRING
    },
		detailname_en: {
      type: Sequelize.STRING
    },
		descr_en: {
      type: Sequelize.STRING
    },
		validated: {
      type: Sequelize.STRING(45)
    },
  }, {
    classMethods: {
      associate(models) {
         Product.belongsTo(sequelize.models.Vendor, { as : 'vendorcontact', targetKey: 'id' });
      }
    }
  });

  return Product;
};
