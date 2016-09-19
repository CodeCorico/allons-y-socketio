module.exports = function() {
  'use strict';

  var extend = require('extend');

  DependencyInjection.service('$SocketsService', function($io) {

    return new (function SocketsService() {

      var _this = this;

      this.reserveSockets = function(socket, count) {
        socket.socketsReserved += count;
        $io.socketsReserved += count;
      };

      this.unreserveSockets = function(socket, count) {
        count = Math.min(count, socket.socketsReserved);

        socket.socketsReserved -= count;
        $io.socketsReserved -= count;
      };

      this.each = function(iterateFunc) {
        for (var sessionsName in $io.sockets.connected) {
          if (iterateFunc($io.sockets.connected[sessionsName], sessionsName) === false) {
            break;
          }
        }
      };

      this.emit = function(ownerSocket, filters, socketAction, eventName, args) {
        _this.each(function(socket) {
          return _this.emitSocket(socket, ownerSocket, filters, socketAction, eventName, args);
        });
      };

      this.emitSocket = function(socket, ownerSocket, filters, socketAction, eventName, args) {
        var match = true,
            filter;

        if (filters) {
          for (filter in filters) {
            var filtervalue = filters[filter],
                namespace = socket,
                exists = true,
                filterNamespace = filter.split('.');

            if (filter == 'permissions') {
              if (!socket.user || !socket.user.id) {
                match = false;
                break;
              }

              if (!socket.user.hasPermissions(filtervalue)) {
                match = false;
                break;
              }

              continue;
            }

            for (var i = 0; i < filterNamespace.length; i++) {
              var name = filterNamespace[i];

              if (typeof namespace != 'object' || namespace === null || (typeof namespace[name] == 'undefined' && i < filterNamespace.length - 1)) {
                return;
              }

              namespace = namespace[name];
            }

            if (!exists) {
              match = false;
              break;
            }
            else if (filtervalue instanceof RegExp) {
              if (!namespace.match(filtervalue)) {
                match = false;
                break;
              }
            }
            else if (namespace !== filtervalue) {
              match = false;
              break;
            }
          }
        }

        if (match) {
          if (socketAction) {
            socketAction(socket);
          }

          socket.emit(eventName, extend(true, {
            isOwner: ownerSocket == socket
          }, args));
        }
      };

      this.error = function($socket, $message, sendEvent, errorText, extendArgs) {
        var args = {
          isOwner: true,
          error: errorText,
          _message: $message
        };

        if (extendArgs) {
          extend(true, args, extendArgs);
        }

        $socket.emit(sendEvent, args);
      };

    })();
  });

};
