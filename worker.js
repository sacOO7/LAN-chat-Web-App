var SCWorker = require('socketcluster/scworker');
var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

class Worker extends SCWorker {
  run() {
    var worker = this;

    console.log('   >> Worker PID:', process.pid);

    var app = require('express')();

    var httpServer = worker.httpServer;
    var scServer = worker.scServer;

    app.use(serveStatic(path.resolve(__dirname, 'public')));

    httpServer.on('request', app);

    var count = 0;

    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {

      // Some sample logic to show how to handle client events,
      // replace this with your own logic

        console.log("User Connected ");

      socket.on('sampleClientEvent', function (data) {
        count++;
        console.log('Handled sampleClientEvent', data);
        scServer.exchange.publish('sample', count);
      });

      var interval = setInterval(function () {
        socket.emit('rand', {
          rand: Math.floor(Math.random() * 5)
        });
      }, 1000);

    socket.on('chat', function (data) {
            console.log('Chat:', data);
        scServer.global.publish('yell', data);
    });

      socket.on('disconnect', function () {
          console.log("User Disconnected");
        clearInterval(interval);
      });
    });
  }
}

new Worker();

