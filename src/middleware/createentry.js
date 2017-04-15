'use strict';

var OpenGtinDB = require('opengtindb-client');

module.exports = function(app) {
  return function(req, res, next) {
    // Perform actions

    next();
  };
};
