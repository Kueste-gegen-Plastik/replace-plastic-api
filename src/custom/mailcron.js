const cron = require('node-cron');
const nodemailer = require('nodemailer');

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
    mails.forEach(mail => {
      this.app.service('vendors').get(mail.vendorId).then(vendor => {
        if(!vendor || !vendor.hasOwnProperty('dataValues') || !vendor.dataValues.email) return Promise.reject('No valid vendor Data');
        return this.mailer.sendMail(Object.assign(this.config, {
            to: vendor.dataValues.email,
            text: mail.text
        })).then(res => {
          // mail sent
          return this.app.service('mails').patch(mail.id, {
            sent : 1
          });
        }).then(res => {
          console.log("Mail sent!");
        });
      }).catch(err => {
        console.log("MAIL FAILED", err)
      })
    })
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
        return mails.data
          .filter(mail =>mail.productId && mail.vendorId)
          .map(itm => itm.dataValues);
      } else {
        return [];
      }
    })
  }

}

module.exports = MailCron;
