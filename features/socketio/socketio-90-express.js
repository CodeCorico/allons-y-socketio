'use strict';

module.exports = function($allonsy, $http) {
  if (process.env.SOCKETIO && process.env.SOCKETIO == 'false') {
    return;
  }

  var SOCKETIO_MAX = parseInt(process.env.SOCKETIO_MAX || 1000, 10),

      path = require('path'),
      io = require('socket.io')($http),
      socketIoCookieParser = require('socket.io-cookie-parser');

  io.use(socketIoCookieParser(process.env.EXPRESS_COOKIE_SECRET));

  DependencyInjection.service('$io', function() {
    return io;
  });

  io.socketsReserved = 0;

  $allonsy.sendMessage({
    event: 'update(socketio/sockets)',
    sockets: 0,
    socketsReserved: 0
  });

  require(path.resolve(__dirname, '../sockets/sockets-service-back.js'))();

  io.on('connection', function(socket) {
    socket.socketsReserved = 0;

    if (io.sockets.length + io.socketsReserved > SOCKETIO_MAX) {
      socket.emit('full-sockets');

      socket.disconnect();
    }
    else {
      $allonsy.sendMessage({
        event: 'update(socketio/sockets)',
        sockets: io.sockets.length,
        socketsReserved: io.socketsReserved
      });

      socket.on('disconnect', function() {
        if (socket.socketsReserved) {
          io.socketsReserved -= socket.socketsReserved;
        }

        $allonsy.sendMessage({
          event: 'update(socketio/sockets)',
          sockets: io.sockets.length,
          socketsReserved: io.socketsReserved
        });
      });
    }
  });

  var socketioFiles = $allonsy.findInFeaturesSync('*-socketio.js');

  socketioFiles.forEach(function(file) {
    DependencyInjection.injector.controller.invoke(null, require(path.resolve(file)));
  });
};
