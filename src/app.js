'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const swagger = require('feathers-swagger');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const Mailer = require('feathers-mailer');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');
const sendmails = require('./lib/sendmails');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

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
  .configure(swagger({
    docsPath: '/docs',
    uiIndex: true,
    info: {
      title: 'ReplasePlastic API',
      description: 'Die API der ReplacePlastic-App'
    }
  }))
  .use('/mailer', Mailer(mandrill({
    auth: {
      apiKey: process.env.MANDRILL_API_KEY
    }
  })))
  .configure(services)
  .configure(middleware);

module.exports = app;
