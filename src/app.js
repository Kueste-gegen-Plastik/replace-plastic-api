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
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const mailstatus = require('./custom/mailstatus');
const MailCron = require('./custom/mailcron');
const EventEmitter = require('events');

const app = feathers();
class MailEmitter extends EventEmitter {};
const mailEmitter = new MailEmitter();


app.configure(configuration(path.join(__dirname, '..')));

app.set('mailEmitter', mailEmitter);

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon(path.join(app.get('public'), 'favicon.ico')))
  .use('/', serveStatic(app.get('public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(middleware)


const mailCron = new MailCron(app, mailEmitter);

module.exports = app;
