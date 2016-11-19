'use strict';

module.exports = function($allonsy, $http, $server) {
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

  io.socketsCount = 0;
  io.socketsReserved = 0;

  function _updateParentSockets() {
    $allonsy.sendMessage({
      event: 'update(socketio/sockets)',
      sockets: io.socketsCount,
      socketsReserved: io.socketsReserved
    });
  }

  _updateParentSockets();

  require(path.resolve(__dirname, '../sockets/models/sockets-service-back.js'))();

  var $BodyDataService = DependencyInjection.injector.controller.get('$BodyDataService', true);

  if ($BodyDataService) {
    $server.use(function(req, res, next) {
      $allonsy.sendMessage({
        event: 'call(socketio/url)'
      }, function(message) {
        $BodyDataService.data(req, 'sockets', {
          url: message.url
        });

        next();
      });
    });
  }

  io.on('connection', function(socket) {
    socket.socketsReserved = 0;
    io.socketsCount++;

    if (io.socketsCount + io.socketsReserved > SOCKETIO_MAX) {
      socket.emit('full-sockets');

      socket.disconnect();
    }
    else {
      _updateParentSockets();

      socket.on('disconnect', function() {
        io.socketsCount--;

        if (socket.socketsReserved) {
          io.socketsReserved -= socket.socketsReserved;
        }

        _updateParentSockets();
      });
    }
  });

  var socketioFiles = $allonsy.findInFeaturesSync('*-socketio.js');

  socketioFiles.forEach(function(file) {
    DependencyInjection.injector.controller.invoke(null, require(path.resolve(file)));
  });
};
