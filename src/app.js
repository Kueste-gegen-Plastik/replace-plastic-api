'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const middleware = require('./middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const services = require('./services');
const mailstatus = require('./custom/mailstatus');
const MailCron = require('./custom/mailcron');
const EventEmitter = require('events');

const app = feathers();
class MailEmitter extends EventEmitter {};
const mailEmitter = new MailEmitter();

const authLimiter = new rateLimit({
  windowMs: 15*60*1000,
  delayAfter: 3,
  delayMs: 3*1000,
  max: 10,
  message: "Es wurden zu viele Zugriffe in kurzer Zeit erkannt. Bitte warten Sie 15 Minuten."
});
const statsLimiter = new rateLimit({
  windowMs: 15*60*1000,
  delayAfter: 3,
  delayMs: 3*1000,
  max: 10,
  message: "Es wurden zu viele Zugriffe in kurzer Zeit erkannt. Bitte warten Sie 15 Minuten."
});

app.configure(configuration(path.join(__dirname, '..')));

app.set('mailEmitter', mailEmitter);

app.use(compress())
  .options('*', cors())
  .use('/auth', authLimiter)
  .use('/auth/local', authLimiter)
  .use('/stats', statsLimiter)
  .use(cors())
  .use(helmet())
  .use(favicon(path.join(app.get('public'), 'favicon.ico')))
  .use('/', serveStatic(app.get('public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(services)
  .configure(middleware)

if(process.env.NODE_ENV === 'development') {
  // create a default admin if no users are available
  const userService = app.service('users')
  userService.find({ query: {} }).then(response => {
    const users = response.data || response
    if (!users.length) {
        userService.create({ username: 'admin', email: 'admin@example.com',  roles: 'admin', password: '1234' })
        .then(user => {
          console.log('user created', user)
        })
    }
  });
}

// mailcron periodically sends mails to vendors
const mailCron = new MailCron(app, mailEmitter);

module.exports = app;
