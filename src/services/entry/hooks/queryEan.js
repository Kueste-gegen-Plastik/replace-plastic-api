var OpenGtinDB = require('opengtindb-client'),
    Barcoder = require('barcoder'),
    utf8 = require('utf8');

var createProductEntry = function(bc, hook) {
  var result = {
    barcode : bc
  };
  try {
    var eanDb = new OpenGtinDB(hook.app.settings.opengtindb);
    return eanDb.get(bc).then(res => {
      if(res.hasOwnProperty('error') && parseInt(res.error) == 0) {
        res.data[0].contents = res.data[0].contents.join(',');
        Object.assign(result, res.data[0]);
      }
      return hook.app.service('product').create(result).then(res => {
        return Promise.resolve(hook);
      });
    });
  } catch(err) {
    return hook.app.service('product').create(result).then(res => {
      return Promise.resolve(hook);
    });
  }
}

module.exports = function(options) {
  return function(hook) {
    var bc = hook.data.barcode || undefined;
    if(typeof bc === 'undefined' || !Barcoder.validate(bc + '')) {
      throw new Error('Please provide a valid EAN-Barcode');
    }
    return hook.app.service('product').find({
      query: {
        barcode: bc,
        $limit : 1,
        $select: ['id']
      },
      raw : true
    }).then(products => {
      // product already existant, add the product id to the payload
      if(products.hasOwnProperty('total') && products.total > 0) {
        var id;
        products.data.forEach(product => {
          id = product.getDataValue('id');
        });
        hook.data.ProductId = id;
        hook.data.sent = false;
        return Promise.resolve(hook);
      } else {
        // product not existant: query the gtindb
        return createProductEntry(bc, hook);
      }
    }).then(res => {
      return Promise.resolve(hook);
    }).catch(err => {
      throw new Error(err.message);
    })
  };
};
