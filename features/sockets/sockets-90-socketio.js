'use strict';

module.exports = function($allonsy, $io) {

  var path = require('path'),
      eventsFiles = $allonsy.findInFeaturesSync('controllers/*-event.js'),
      allConfigs = [],
      eventFilters = [];

  eventsFiles.forEach(function(file) {
    var configs = require(path.resolve(file));

    if (!Array.isArray(configs)) {
      configs = [configs];
    }

    allConfigs = allConfigs.concat(configs);
  });

  var SocketEvent = function() {

    this.validMessage = function($message, conditions) {
      if (!$message || typeof $message != 'object') {
        return false;
      }

      conditions = conditions || {};

      var keys = Object.keys(conditions),
          goodMessage = true;

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        conditions[key] = conditions[key] || [];
        if (!Array.isArray(conditions[key])) {
          conditions[key] = [conditions[key]];
        }

        for (var j = 0; j < conditions[key].length; j++) {
          if (conditions[key][j] == 'filled') {
            if (!$message[key] && (typeof $message[key] != 'number' || $message[key] !== 0)) {
              goodMessage = false;

              break;
            }
          }
          else if (typeof $message[key] != conditions[key][j]) {
            goodMessage = false;

            break;
          }
        }

        if (!goodMessage) {
          break;
        }
      }

      return goodMessage;
    };
  };

  $io.eventFilter = function(func) {
    if (eventFilters.indexOf(func) > -1) {
      return;
    }

    eventFilters.push(func);
  };

  $io.removeEventFilter = function(func) {
    var index = eventFilters.indexOf(func);

    if (index < 0) {
      return;
    }

    eventFilters.splice(index, 1);
  };

  $io.on('connection', function(socket) {

    allConfigs.forEach(function(config) {

      socket.on(config.event, function(message) {
        for (var i = 0; i < eventFilters.length; i++) {
          if (!eventFilters[i](socket, config, message)) {
            return;
          }
        }

        DependencyInjection.injector.controller.invoke(new SocketEvent(), config.controller, {
          controller: {
            $event: function() {
              return config.event;
            },

            $socket: function() {
              return socket;
            },

            $message: function() {
              return message;
            },

            $done: function() {
              return function() {};
            }
          }
        });
      });
    });
  });
};
