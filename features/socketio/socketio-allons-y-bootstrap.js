'use strict';

module.exports = {
  bootstrap: function($allonsy, $options, $done) {
    if ((!process.env.SOCKETIO || process.env.SOCKETIO == 'true') && $options.owner == 'start') {
      $allonsy.watcher('Allons-y Express', [
        '*-socketio.js',
        'controllers/*-event.js'
      ]);
    }

    $done();
  }
};

