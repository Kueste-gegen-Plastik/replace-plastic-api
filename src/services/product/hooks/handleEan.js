var OpenGtinDB = require('opengtindb-client'),
    Barcoder = require('barcoder'),
    utf8 = require('utf8'),
    errors = require('feathers-errors');

var searchProduct = function(bc, hook) {
  var result = {
    barcode : bc
  };
  try {
    var eanDb = new OpenGtinDB(hook.app.settings.opengtindb);
    return eanDb.get(bc).then(res => {
      if(res.hasOwnProperty('error') && parseInt(res.error) == 0) {
        res.data[0].contents = res.data[0].contents.join(',');
        res.data[0].pack = res.data[0].pack.join(',');
        res.data[0].maincat = res.data[0].maincat == '' ? -1 : res.data[0].maincat;
        res.data[0].subcat = res.data[0].subcat == '' ? -1 : res.data[0].subcat;
        res.data[0].maincatnum = res.data[0].maincatnum == '' ? -1 : res.data[0].maincatnum;
        res.data[0].subcatnum = res.data[0].subcatnum == '' ? -1 : res.data[0].subcatnum;
        Object.assign(result, res.data[0]);
      }
      return hook.app.service('product').create(result).then(res => {
        if(typeof res.data === 'undefined') {
          return res;
        }
        var productsMapped = res.data.map(product => {
          return product.get({ plain: true })
        });
        return productsMapped;
      })
    })
  } catch(err) {
    return Promise.reject(err);
  }
}

module.exports = function(options) {
  return function(hook) {
    var bc = hook.id || undefined;
    if(typeof bc === 'undefined' || !Barcoder.validate(bc + '')) {
      throw new Error('Bitte geben Sie einen gültigen Barcode ein.');
    }
    return hook.app.service('product').find({
      query: {
        barcode: bc,
        $limit : 1,
        $select: ['id', 'barcode', 'name', 'detailname', 'maincat', 'descr', 'vendor']
      },
      plain: true,
      raw : true
    }).then(products => {
      // product already existant, add the product id to the payload
      if(products.hasOwnProperty('total') && products.total > 0) {
        var productsMapped = products.data.map(product => {
          return product.get({ plain: true })
        });
        hook.result = productsMapped;
        return Promise.resolve(hook);
      } else {
        // product not existant: query the gtindb
        return searchProduct(bc, hook).then(res => {
          hook.result = res.data;
          Promise.resolve(hook);
        });
      }
    }).catch(err => {
      if(err.message == 'die EAN konnte nicht gefunden werden') {
        throw new errors.NotFound('Die EAN konnte nicht gefunden werden');
      } else {
        throw new Error(err.message);
      }
    })
  };
};
