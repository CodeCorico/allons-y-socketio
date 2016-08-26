'use strict';

module.exports = [process.env.SOCKETIO || process.env.SOCKETIO == 'true' ? {
  url: 'sockets-url',
  controller: function($allonsy, $req, $res) {
    $allonsy.sendMessage({
      event: 'call(socketio/url)'
    }, function(message) {
      if (message.url == 'full-sockets') {
        return $res.send({
          error: message.url
        });
      }

      $res.send({
        url: message.url
      });
    });
  }
} : null];

