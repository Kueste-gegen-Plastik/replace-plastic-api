const OpenGtinDB = require('opengtindb-client');
const Barcoder = require('barcoder');

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
          productId: hook.data.ProductId || null,
          vendorId: hook.data.VendorId || null,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        }).then(res => {
          return Promise.resolve(hook);
        }).catch(err => {
          console.log("Error", err);
        });
      }
    });
  };
};
