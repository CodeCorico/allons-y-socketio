module.exports = function() {
  'use strict';

  DependencyInjection.service('$SocketIOService', function() {

    return new (function SocketIOService() {

      var SOCKETIO_MAX = parseInt(process.env.SOCKETIO_MAX || 1000, 10),

          _processes = {};

      this.processSockets = function(p, sockets, socketsReserved) {
        if (typeof sockets == 'undefined') {
          return _processes[p.id];
        }

        var index = parseInt(p.id.split('.')[1], 10),
            port = parseInt(process.env.EXPRESS_PORT || 8086, 10) + index;

        _processes[p.id] = _processes[p.id] || {};
        _processes[p.id].sockets = sockets;
        _processes[p.id].socketsReserved = socketsReserved;
        _processes[p.id].url = process.env.SOCKETIO_URL
          .replace(/{port}/g, port)
          .replace(/{index}/g, index);

        return _processes[p.id];
      };

      this.socketsUrl = function() {
        var minSockets = {
          id: null,
          count: SOCKETIO_MAX
        };

        Object.keys(_processes).forEach(function(id) {
          var count = _processes[id].sockets + _processes[id].socketsReserved;

          if (minSockets.count > count) {
            minSockets.id = id;
            minSockets.count = count;
            minSockets.url = _processes[id].url;
          }
        });

        if (!minSockets.id) {
          return 'full-sockets';
        }

        return minSockets.url;
      };

    })();
  });

};
