var OpenGtinDB = require('opengtindb-client'),
    Barcoder = require('barcoder'),
    utf8 = require('utf8');

module.exports = function(options) {
  return function(hook) {
    return hook.app.service('mails').find({
      query: {
        productId: hook.data.ProductId,
        sent: 0,
        $limit : 1,
        $select: ['id']
      },
      raw : true
    }).then(mail => {
      if(mail.hasOwnProperty('total') && mail.total > 0) {
        return Promise.resolve(hook);
      } else {
        return hook.app.service('mails').create({
          sent: 0,
          text: `HUHUHUHU`,
          productId: hook.data.ProductId || null,
          vendorId: hook.data.VendorId || null,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        }).then(res => {
          return Promise.resolve(hook);
        });
      }
    });
  };
};
