'use strict';

module.exports = function($allonsy, $http) {
  if (process.env.SOCKETIO && process.env.SOCKETIO == 'false') {
    return;
  }

  var path = require('path'),
      io = require('socket.io')($http),
      socketIoCookieParser = require('socket.io-cookie-parser');

  io.use(socketIoCookieParser(process.env.EXPRESS_COOKIE_SECRET));

  DependencyInjection.service('$io', [function() {
    return io;
  }]);

  require(path.resolve(__dirname, '../sockets/models/sockets-service-back.js'))();

  var socketioFiles = $allonsy.findInFeaturesSync('*-socketio.js');

  socketioFiles.forEach(function(file) {
    DependencyInjection.injector.controller.invoke(null, require(path.resolve(file)));
  });
};
