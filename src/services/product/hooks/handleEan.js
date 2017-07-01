var OpenGtinDB = require('opengtindb-client'),
    Barcoder = require('barcoder'),
    utf8 = require('utf8'),
    errors = require('feathers-errors');


var searchProduct = function(bc, hook) {
  var result = {
    barcode : bc,
		asin: '',
		name: 'Unbekannt',
		detailname: 'Unbekannt',
		vendor: 'Unbekannt',
		maincat: 'Unbekannt',
		subcat: 'Unbekannt',
		maincatnum: 0,
		subcatnum: 0,
		contents: 'Unbekannt',
		pack: 'Unbekannt',
		origin: 'Unbekannt',
		descr: 'Unbekannt',
		name_en: 'Unbekannt',
		detailname_en: 'Unbekannt',
		descr_en:  'Unbekannt',
		validated: 'Unbekannt'
  };
  try {
    // check if there is a product in the opengtindb
    var eanDb = new OpenGtinDB(hook.app.settings.opengtindb);
    return eanDb.get(bc).then(res => {
      if(res.hasOwnProperty('error') && parseInt(res.error) == 0) {
        // we only need the first entry (there can be more than one)
        res.data[0].contents = res.data[0].contents.join(',');
        res.data[0].pack = res.data[0].pack.join(',');
        res.data[0].maincat = res.data[0].maincat == '' ? -1 : res.data[0].maincat;
        res.data[0].subcat = res.data[0].subcat == '' ? -1 : res.data[0].subcat;
        res.data[0].maincatnum = res.data[0].maincatnum == '' ? -1 : res.data[0].maincatnum;
        res.data[0].subcatnum = res.data[0].subcatnum == '' ? -1 : res.data[0].subcatnum;
        Object.assign(result, res.data[0]);
      };
      // create a product in the db
      return hook.app.service('product').create(result).then(res => {
        return Promise.resolve(hook);
      });
    });
  } catch(err) {
    //
    return hook.app.service('product').create(result).then(res => {
      return Promise.resolve(hook);
    });
  }
}

module.exports = function(options) {
  return function(hook) {
    var bc = hook.id || undefined;
    // check if a valid barcode was provided
    if(typeof bc === 'undefined' || !Barcoder.validate(bc + '')) {
      throw new Error('Bitte geben Sie einen gültigen Barcode ein.');
    }
    // check if a product with the given barcode already exists
    return hook.app.service('product').find({
      query: {
        barcode: bc,
        $limit : 1,
        $select: ['id', 'barcode', 'name', 'detailname', 'maincat', 'descr', 'vendor']
      },
      raw : true
    }).then(products => {
      // product already existant, add the product id to the payload
      if(products.hasOwnProperty('total') && products.total > 0) {
        if(products.data[0].name) {
          hook.result = products.data;
          return Promise.resolve(hook);
        } else {
          return Promise.resolve(hook);
        }
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
