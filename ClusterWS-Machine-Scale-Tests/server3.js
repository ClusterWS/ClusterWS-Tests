const express = require('express')
const ClusterWS = require('./index')
const path = require("path")


new ClusterWS({
    worker: Worker,
    port: 8005,
    brokersPorts: [8006],
    horizontalScaleOptions: {
        brokersUrls: [
            'wss://localhost:8080',
            'ws://localhost:8081'
        ],
        key: 'hello'
    }
})


function Worker() {
    const wss = this.wss
    const server = this.server

    const app = express()
    app.use(express.static('public', { index: false }))
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname + '/public/index3.html')))
    server.on('request', app)

    wss.on('connection', (socket) => {
        console.log('user connected')
    })
}