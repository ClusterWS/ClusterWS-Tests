const express = require('express')
const ClusterWS = require('./index')
const path = require('path')

let clusterws = new ClusterWS({
    port: 443,
    worker: Worker,
    // Uncomment Next line to test binary
    // useBinary: true
})

function Worker() {
    const httpServer = this.httpServer
    const socketServer = this.socketServer

    const app = express()
    app.use(express.static(path.join(__dirname, '../Client'), { index: false }))
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname, '../Client/index.manual.html')))
    httpServer.on('request', app)

    socketServer.on('connection', (socket) => {
        socket.on('echo', (message) => socket.send('echo', message))
        socket.on('String', (data) => socket.send('String', data))
        socket.on('Boolean', (data) => socket.send('Boolean', data))
        socket.on('Number', (data) => socket.send('Number', data))
        socket.on('Array', (data) => socket.send('Array', data))
        socket.on('Object', (data) => socket.send('Object', data))
        socket.on('Null', (data) => socket.send('Null', data))

        socket.on('publish', (data) => socketServer.publish('Messag From Server', data))
    })
}