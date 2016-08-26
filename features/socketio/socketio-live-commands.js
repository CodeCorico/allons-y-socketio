'use strict';

module.exports = function($allonsy) {
  $allonsy.outputInfo('\n► sockets:\n\n');

  var path = require('path');

  require(path.resolve(__dirname, 'socketio-service-back.js'))();

  var $SocketIOService = DependencyInjection.injector.controller.get('$SocketIOService'),
      child = $allonsy.childByName('Allons-y Express');

  if (!child || !child.processes || !child.processes.length) {
    $allonsy.outputInfo('  No Express server started\n');
  }

  $allonsy.outputInfo('  Sockets max per server: ' + parseInt(process.env.SOCKETIO_MAX || 1000, 10) + '\n\n');

  child.processes.forEach(function(p) {
    var socketsData = $SocketIOService.processSockets(p) || {
      sockets: 0,
      socketsReserved: 0
    };

    console.log([
      '  ∙ [', $allonsy.textInfo(p.name), ' #', p.id, '] ',
      'sockets: ', $allonsy.textWarning(socketsData.sockets),
      ', reserved: ', $allonsy.textWarning(socketsData.socketsReserved)
    ].join(''));
  });

  console.log('');
};
