'use strict';

module.exports = function($allonsy) {
  $allonsy.outputInfo('► sockets:\n');

  var path = require('path');

  require(path.resolve(__dirname, 'models/socketio-service-back.js'))();

  var $SocketIOService = DependencyInjection.injector.controller.get('$SocketIOService'),
      child = $allonsy.childByName('Allons-y Express');

  if (!child || !child.processes || !child.processes.length) {
    $allonsy.outputInfo('  No Express server started');
  }

  $allonsy.outputInfo('  Sockets max per server: ' + parseInt(process.env.SOCKETIO_MAX || 1000, 10) + '\n');

  child.processes.forEach(function(p) {
    var socketsData = $SocketIOService.processSockets(p) || {
          sockets: 0,
          socketsReserved: 0
        },
        index = p.id.split('.')[1];

    $allonsy.output([
      '  ∙ [', $allonsy.textInfo(p.name), ' #', p.id, '] ',
      '(', socketsData.url, ') ',
      'sockets: ', $allonsy.textWarning(socketsData.sockets),
      ', reserved: ', $allonsy.textWarning(socketsData.socketsReserved)
    ].join(''), '\n');
  });
};
