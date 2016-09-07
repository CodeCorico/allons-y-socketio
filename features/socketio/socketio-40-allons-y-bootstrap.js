'use strict';

var path = require('path');

module.exports = {
  bootstrap: function($allonsy, $options, $done) {
    if (
      (process.env.EXPRESS && process.env.EXPRESS == 'false') ||
      (process.env.SOCKETIO && process.env.SOCKETIO == 'false') ||
      $options.owner != 'start'
    ) {
      return $done();
    }

    $allonsy.watcher('Allons-y Express', [
      '*-socketio.js',
      'controllers/*-event.js'
    ]);

    require(path.resolve(__dirname, 'socketio-service-back.js'))();

    var $SocketIOService = DependencyInjection.injector.controller.get('$SocketIOService');

    $allonsy.on('message', function(args) {
      if (args.event == 'update(socketio/sockets)') {
        $SocketIOService.processSockets(args.p, args.sockets, args.socketsReserved);
      }
      else if (args.event == 'call(socketio/url)') {
        $allonsy.sendMessage({
          event: args.event,
          messageId: args.messageId,
          url: $SocketIOService.socketsUrl()
        });
      }
    });

    $done();
  },
  liveCommands: [process.env.SOCKETIO || process.env.SOCKETIO == 'true' ? {
    commands: 'sockets',
    description: 'output the sockets connected by server',
    action: require(path.resolve(__dirname, 'socketio-live-commands.js'))
  } : null]
};

