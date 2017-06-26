const cron = require('node-cron');
const nodemailer = require('nodemailer');
const swig = require('swig');
const template = swig.compileFile(__dirname + '/../mails/vendor.swig');
const htmlToText = require('html-to-text');

class MailCron {

  /**
   * @constuctor
   * @param {*} app
   * @param {EventEmitter} mailEmitter
   * @param {String} pattern
   * @param {Integer} daysSince
   */
  constructor(app, mailEmitter, pattern, daysSince) {
    this.app = app;
    this.config = app.get('mailserver');
    this.mailEmitter = mailEmitter;
    this.daysSince = daysSince ? parseInt(daysSince, 10) : 28;
    this.cron = cron.schedule(pattern || '*/5 * * * *', () => {
      if(!this.active) return;
      this.fire();
    });
    this.mailer = nodemailer.createTransport(this.config);
    this.active = true;
    this.mailEmitter.on('mailstatus', status => {
      this.active = status;
    });
    this.fire();
  }

  /**
   * Fires the process to send mails
   * @returns {Promise}
   */
  fire() {
    return this.checkMailsToSend().then(mails => {
      return this.sendMails(mails);
    }).catch(err => {
      console.log("ERROR SENDING MAILS", err);
    })
  }

  /**
   * Iterates all passed mail entrys, checks if they've got
   * a vendor and sends them the Emails. The "sent" flag of
   * successfully sent mails is set to "1" afterwards
   * @param {Array} mails The Mail-Entrys to be sent
   * @returns undefined
   */
  sendMails(mails) {
    // iterate each mail to send
    mails.forEach(mail => {
      // get the vendor contact
      let foundEntries = [], foundVendor;
      this.app.service('vendors').get(mail.vendorId).then(vendor => {
        if(!vendor || !vendor.hasOwnProperty('dataValues') || !vendor.dataValues.email) return Promise.reject('No valid vendor Data');
        // get all entries that aren't sent yet
        foundVendor = vendor;
        return this.app.service('entries').find({
          query: {
            ProductId: mail.productId,
            sent: 0
          }
        });
      }).then(entries => {
        foundEntries = entries.data;
        if(!foundEntries.length) return Promise.reject('No entries found for sending a mail!');
        return this.app.service('product').get(mail.productId);
      }).then(product => {
        if(!product || !product.hasOwnProperty('dataValues') || !product.dataValues.detailname) return Promise.reject('No valid product found');
        let mailText = template({
          entriesamount: foundEntries.length,
          product: product.dataValues.detailname
        });
        return this.mailer.sendMail(Object.assign(this.config, {
            to: foundVendor.dataValues.email,
            html: mailText,
            text: htmlToText.fromString(mailText)
        }));
      }).then(res => {
        // mail sent
        return this.app.service('mails').patch(mail.id, {
          sent : 1
        });
      }).then(res => {
        return Promise.all(foundEntries.map(entry => {
          return this.app.service('entries').patch(entry.dataValues.id, {
            sent: 1
          });
        }));
      }).then(res => {
        console.log("Mail sent!");
      }).catch(err => {
        console.log("MAIL FAILED", err)
      });
    });
  }

  /**
   * Searches for mails that need to be send
   */
  checkMailsToSend() {
    return this.app.service('mails').find({
      query: {
        createdAt: {
          $lt: new Date() // new Date(new Date() - 24 * 60 * 60 * this.daysSince * 1000)
        },
        sent: 0
      }
    }).then(mails => {
      if(mails.hasOwnProperty('total') && mails.total > 0) {
        let retVal = mails.data.filter(mail => mail.productId && mail.vendorId)
          .map(itm => itm.dataValues);
        if(retVal.length < mails.data.length) {
          // send mails to admin: reminder to add vendors to products
          this.sendReminderMails(mails);
        }
        return retVal;
      } else {
        return [];
      }
    })
  }

  sendReminderMails() {
    // @TODO
  }

}

module.exports = MailCron;
