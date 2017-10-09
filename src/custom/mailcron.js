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
  async fire() {
    if (!this.active) return;
    try {
      const mails = await this.checkMailsToSend();
      if(!mails.length) return;
      this.sendMails(mails);
    } catch(err) {
      this.log("error", "Error in checkMailsToSend" + err.message);
    }
  }


  async getVendorById(id) {
    return this.app.service('vendors').get(id).then(vendor => {
      if (!vendor || !vendor.hasOwnProperty('email') || !vendor.email) {
        throw new Error('No valid vendor Data');
      }
      // get all entries that aren't sent yet
      return vendor;
    })
  }

  async getEntriesForProducts(ids) {
    return this.app.service('entries').find({
        query: {
          ProductId: ids,
          sent: 0
        },
        group: ['ProductId']
    });
  }


  getAllVendorMails(id) {
    return this.app.service('mails').find({
        query: {
          vendorId: id,
          sent: 0
        },
        attributes: ['id']
    });
  }

  buildMailData(entries) {
      let mailEntries = [];
      // combine data for the mail
      entries.data.forEach(entry => {
        let idx = 0;
        var itm = mailEntries.filter((entryItem, idx) => {
          if(entryItem.ProductId === entry.ProductId || entryItem.barcode === entry.barcode) {
            idx = idx;
            return true
          }
          return false;
        });
        if(!itm.length) {
          mailEntries.push({
            barcode: entry.barcode,
            ProductId: entry.id,
            count: 1,
            barcode: entry.barcode,
            productname: `${entry['Product.name']} - ${entry['Product.detailname']}`
          });
        } else {
          mailEntries[idx].count++;
        }
      });
      return mailEntries;
  }

  /**
   * Iterates all passed mail entrys, checks if they've got
   * a vendor and sends them the Emails. The "sent" flag of
   * successfully sent mails is set to "1" afterwards
   * @param {Array} mails The Mail-Entrys to be sent
   * @returns undefined
   */
  async sendMails(mails) {
    let foundEntries = [],
        foundVendor;

    const vendors = new Set(mails.map(mail => mail.vendorId));

    for(let vendorid of vendors) {

      try {
        const vendor = await this.getVendorById(vendorid);
        const vendorMails = await this.getAllVendorMails(vendorid);
        if(!vendorMails.data.length) {
          throw new Error(`No Mails found for vendor ${vendorid}`);
        }

        const mailProductIds = vendorMails.data.map(mail => mail.productId);
        const entries = await this.getEntriesForProducts(mailProductIds);
        if(!entries.data.length) {
          throw new Error(`No Entries found ${vendorid}`);
        }

        foundEntries = this.buildMailData(entries);
        var fullAmount = foundEntries.reduce((a,b) => {
          if(a.hasOwnProperty('count')) { // first iteration
            return (a.count ? parseInt(a.count,10) : 0) + parseInt(b.count,10);
          }
          return parseInt(a, 10) + parseInt(b.count,10);
        });
        let mailText = vendortemplate({
          foundEntries: foundEntries,
          productsString: foundEntries.map(product => product.productname).join(', '),
          fullAmount: typeof fullAmount === 'object' ? 'Einige' : fullAmount
        });

        var mail = await this.mailer.sendMail(Object.assign(this.config, {
          to: typeof(process.env.NODE_ENV) !== 'undefined' && process.env.NODE_ENV === 'development' ? this.config.reminderEmail : [this.config.reminderEmail, vendor.email],
          html: mailText,
          text: htmlToText.fromString(mailText)
        }));
        if(!mail.accepted.length) {
          throw new Error(`No Mails could be sent to found ${vendor.email}`);
        }
        this.log("info", `Mail sent to: ${mail.accepted.join(',')} (messageId: ${mail.messageId})`);
        let mailsToPatch = vendorMails.data.map(mail => {
          return mail.id;
        });
        await this.app.service('mails').patch(mailsToPatch, {
          sent: 1,
          reminded: 1
        });
        this.log("info", `Mails patched (sent): ${mailsToPatch.join(',')}`);
        let entriesToPatch = entries.data.map(entry => {
          return entry.id;
        });
        await this.app.service('entries').patch(entry.id, {
          sent: 1
        });
        this.log("info", `Entries patched (sent): ${entriesToPatch.join(',')}`);

        return foundEntries;

      } catch(err) {
        console.log("ERROR!", err);
      }

    }

  }



  /**
   * Searches for mails that need to be send
   */
  async checkMailsToSend() {
    return this.app.service('mails').find({
      query: {
        createdAt: {
          $lt: new Date(new Date() - 24 * 60 * 60 * this.daysSince * 1000)
        },
        sent: 0
      }
    }).then(mails => {
      let retVal = [];
      if (mails.hasOwnProperty('total') && mails.total > 0) {
        // filter for those mails that have a product and a
        // vendor assigned to them
        retVal = mails.data.filter(mail => {
          return mail.productId && mail.vendorId;
        });
        /* if (retVal.length < mails.data.length) {
          // send mails to admin: reminder to add vendors to products
          this.sendReminderMails(mails);
        } */
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
      return mail && (!mail.productId || !mail.vendorId) && (!mail.reminded || mail.reminded === 0);
    });

    if (!mailsToSend.length) return;

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
          reminded: 1
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
