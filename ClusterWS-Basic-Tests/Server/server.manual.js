const express = require('express');
const ClusterWS = require('./index');
const path = require('path');
const cluster = require('cluster');
const fs = require('fs');
var msgpack = require('msgpack-lite');

if (cluster.isMaster) {
  // make force proccess change connection
  cluster.schedulingPolicy = cluster.SCHED_RR;
}

let clusterws = new ClusterWS({
  port: 8080,
  worker: Worker,
  workers: 3,
  brokers: 1,
  // Uncomment Next line to test binary
  // useBinary: true,
  tlsOptions: {
    key: fs.readFileSync('./Server/ssl/server-key.pem'),
    cert: fs.readFileSync('./Server/ssl/server-cert.pem')
  },
  encodeDecodeEngine: {
    encode: (message) => {
      console.log('encode -> ', message);
      return msgpack.encode(message);
    },
    decode: (message) => {
      console.log('decode -> ', message);
      return msgpack.decode(message.data);
    }
  }
});

function Worker() {
  const wss = this.wss;
  const server = this.server;

  const app = express();
  app.use(express.static(path.join(__dirname, '../Client'), { index: false }));
  app.get('/', (req, res, next) => res.sendFile(path.join(__dirname, '../Client/index.manual.html')));
  server.on('request', app);

  wss.on('connection', (socket) => {
    console.log('connected', process.pid);
    wss.publishToWorkers('Hello world');
    socket.on('echo', (message) => {
      socket.send('echo', message);
    });
    socket.on('publish', (data) => wss.publish('Messag From Server', data));

    socket.on('disconnect', () => {
      console.log('HAs been fired');
    });

    // setTimeout(() => socket.terminate(), 5000)
  });
}
