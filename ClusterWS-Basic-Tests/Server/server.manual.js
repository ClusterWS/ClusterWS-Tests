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
    const wss = this.wss
    const server = this.server

    const app = express()
    app.use(express.static(path.join(__dirname, '../Client'), { index: false }))
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname, '../Client/index.manual.html')))
    server.on('request', app)

    wss.on('connection', (socket) => {
        socket.on('echo', (message) => socket.send('echo', message))
        socket.on('publish', (data) => wss.publish('Messag From Server', data))
    })
}