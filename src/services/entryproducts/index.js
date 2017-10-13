'use strict';

const hooks = require('./hooks');
const Promise = require('bluebird');

module.exports = function(){
  const app = this;

  app.use('/entryproducts', {
    find() {
      const sequelize = app.get('sequelize');
      var products = [], idsResult = [];
      return sequelize.models['Entry'].findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('ProductId')), 'count'],
          'ProductId'
        ],
        group: ['ProductId'],
        where: {
          ProductId: {
            $ne: null
          }
        }
      }).then(ids => {
        idsResult = ids.map(id => id.dataValues);
        return sequelize.models['Product'].findAll({
          attributes: ['id', 'barcode', 'vendor', 'name', 'detailname', 'createdAt'],
          limit: 20,
          order: [['updatedAt', 'DESC']],
          where: {
            id: {
              $in: ids.map(itm => {
                return itm.ProductId
              })
            }
          }
        })
      }).then(products => {
        return products.map(product => {
            product = product.dataValues;
            let id = idsResult.filter(itm => {
              return itm.ProductId === product.id;
            })[0];
            product = Object.assign(product,id);
            delete product.ProductId;
            return product;
        })
      })
    }
  });

  // Get our initialize service to that we can bind hooks
  const entryProductsService = app.service('/entryproducts');
  // Set up our before hooks
  entryProductsService.before(hooks.before);
  // Set up our after hooks
  entryProductsService.after(hooks.after);


};
