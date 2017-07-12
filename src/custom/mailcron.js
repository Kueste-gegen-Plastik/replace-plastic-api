const cron = require('node-cron');
const nodemailer = require('nodemailer');
const swig = require('swig');
const vendortemplate = swig.compileFile(__dirname + '/../mails/vendor.swig');
const remindertemplate = swig.compileFile(__dirname + '/../mails/reminder.swig');
const htmlToText = require('html-to-text');
const winston = require('winston');

class MailCron {

  /**
   * @constuctor
   * @param {*} app
   * @param {EventEmitter} mailEmitter
   * @param {String} pattern
   * @param {Integer} daysSince
   */
  constructor(app, mailEmitter) {
    this.app = app;
    this.config = app.get('mailserver');
    this.cronconfig = app.get('mailcron');
    this.mailEmitter = mailEmitter;
    this.daysSince = parseInt(this.cronconfig.dayssince, 10);
    this.cron = cron.schedule(this.cronconfig.pattern, () => {
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
   * Logs a message
   * @param {String} type the type (one of info|warning|error)
   * @param {String} msg the Message to be logged
   */
  log(type, msg) {
    winston[type](`MailCron: ${msg}`);
  }

  /**
   * Fires the process to send mails
   * @returns {Promise}
   */
  fire() {
    if(!this.active) return;
    return this.checkMailsToSend().then(mails => {
      return this.sendMails(mails);
    }).catch(err => {
      this.log("error", "Error in checkMailsToSend" + err.message);
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
        if(!vendor || !vendor.hasOwnProperty('dataValues') || !vendor.dataValues.email) {
          throw new Error('No valid vendor Data');
        }
        // get all entries that aren't sent yet
        foundVendor = vendor;
        return this.app.service('entries').find({
          query: {
            ProductId: mail.productId,
            sent: 0
          }
        });
      }).then(entries => {
        // save the found entries to reuse them later
        foundEntries = entries.data;
        if(!foundEntries.length) return Promise.reject('No entries found');
        // get the product details for the mail
        return this.app.service('product').get(mail.productId);
      }).then(product => {
        if(!product || !product.hasOwnProperty('dataValues') || !product.dataValues.detailname) {
          throw new Error('No valid product found');
        }
        // create the mailtext from a swig template
        let mailText = vendortemplate({
          entriesamount: foundEntries.length,
          product: product.dataValues.detailname
        });
        // send the mail via nodemailer
        return this.mailer.sendMail(Object.assign(this.config, {
            to: foundVendor.dataValues.email,
            html: mailText,
            text: htmlToText.fromString(mailText)
        }));
      }).then(res => {
        this.log("info", `Mail sent to: ${res.accepted.join(',')} (messageId: ${res.messageId})`);
        return this.app.service('mails').patch(mail.id, {
          sent : 1
        });
      }).then(res => {
        // set the status of all entries to "sent" so they won't
        // be counted again in the next mail
        return Promise.all(foundEntries.map(entry => {
          return this.app.service('entries').patch(entry.dataValues.id, {
            sent: 1
          });
        }));
      }).then(res => {
        this.log("info", "++++++ Mails sent successfully ++++++");
      }).catch(err => {
        this.log("error", "Failed sending Mail:" + err.message);
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
          $lt: new Date(new Date() - 24 * 60 * 60 * this.daysSince * 1000)
        },
        sent: 0
      }
    }).then(mails => {
      let retVal = [];
      if(mails.hasOwnProperty('total') && mails.total > 0) {
        // filter for those mails that have a product and a
        // vendor assigned to them
        retVal = mails.data.filter(mail => {
          return  mail.productId && mail.vendorId;
        }).map(itm => itm.dataValues);
        if(retVal.length < mails.data.length) {
          // send mails to admin: reminder to add vendors to products
          this.sendReminderMails(mails);
        }
      }
      return retVal;
    }).catch(err => {
        this.log("error", "Failed checking for Mails:" + err.message);
    });
  }

  sendReminderMails(mails) {

    // get all mails that have no related vendor or product
    // and send a reminder to the admin
    let mailsToSend = mails.data.filter(mail => {
      return (!mail.productId || !mail.vendorId) && (!mail.reminded || mail.reminded === 0);
    }).map(itm => itm.dataValues);

    if(!mailsToSend.length) return;

    // fill email text with amount of mails to be completed
    let mailText = remindertemplate({
      amount: mailsToSend.length
    });

    // send email
    this.mailer.sendMail(Object.assign(this.config, {
        to: this.config.reminderEmail,
        subject: `ReplacePlastic: ${mailsToSend.length} Zuordnungen fehlen.`,
        html: mailText,
        text: htmlToText.fromString(mailText)
    })).then(res => {
      // set status of all emails to "reminded" to avoid
      // spamming the admin with reminders
      return Promise.all(mailsToSend.map(mail => {
        return this.app.service('mails').patch(mail.id, {
          reminded : 1
        });
      }));
    }).then(res => {
        this.log("info", "++++++ Reminder Mail sent successfully ++++++");
    }).catch(err => {
        this.log("error", "Failed sending reminder mail:" + err.message);
    });

  }

}

module.exports = MailCron;
