const express = require('express')
const ClusterWS = require('./index')
const path = require('path')

let clusterws = new ClusterWS({
    port: 8080,
    worker: Worker,
    pingInterval: 80,
    workers: 2,
    brokers: 2
    // Uncomment Next line to test binary
    // useBinary: true
})

function Worker() {
    const wss = this.wss
    const server = this.server

    const app = express()
    app.use(express.static(path.join(__dirname, '../Client')))

    server.on('request', app)

    wss.on('connection', (socket) => {
        socket.on('echo', (message) => socket.send('echo', message))
        socket.on('String', (data) => socket.send('String', data))
        socket.on('Boolean', (data) => socket.send('Boolean', data))
        socket.on('Number', (data) => socket.send('Number', data))
        socket.on('Array', (data) => socket.send('Array', data))
        socket.on('Object', (data) => socket.send('Object', data))
        socket.on('Null', (data) => socket.send('Null', data))

        socket.on('publish', (data) => wss.publish('Messag From Server', data))
    })
}