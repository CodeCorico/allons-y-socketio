module.exports = function() {
  'use strict';

  DependencyInjection.service('$SocketIOService', function($ExpressService) {

    return new (function SocketIOService() {

      var SOCKETIO_MAX = parseInt(process.env.SOCKETIO_MAX || 1000, 10),

          _processes = {};

      this.processSockets = function(p, sockets, socketsReserved) {
        if (typeof sockets == 'undefined') {
          return _processes[p.id];
        }

        _processes[p.id] = _processes[p.id] || {};
        _processes[p.id].sockets = sockets;
        _processes[p.id].socketsReserved = socketsReserved;

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
          }
        });

        if (!minSockets.id) {
          return 'full-sockets';
        }

        return $ExpressService.processServer({
          id: minSockets.id
        }).url;
      };

    })();
  });

};
