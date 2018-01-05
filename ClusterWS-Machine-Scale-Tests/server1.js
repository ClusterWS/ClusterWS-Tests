const express = require('express')
const ClusterWS = require('./index')
const path = require("path")

new ClusterWS({
    worker: Worker,
    port: 8001,
    brokerPort: 8002,
    scaleOptions: {
        master: true,
        port: 8000
    }
})


function Worker() {
    const wss = this.wss
    const server = this.server

    const app = express()
    app.use(express.static('public', { index: false }))
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname + '/public/index1.html')))

    server.on('request', app)

    wss.on('connection', (socket) => {
        console.log('user connected')
    })
}