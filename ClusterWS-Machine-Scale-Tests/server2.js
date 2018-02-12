const express = require('express')
const ClusterWS = require('./index')
const path = require("path")


new ClusterWS({
    worker: Worker,
    port: 8003,
    brokersPorts: [8004],
    horizontalScaleOptions: {
        masterOptions: {
            port: 8081
        },
        brokersUrls: [
            'wss://localhost:8080'
        ],
        key: 'hello'
    }
})

function Worker() {
    const wss = this.wss
    const server = this.server

    const app = express()
    app.use(express.static('public', { index: false }))
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname + '/public/index2.html')))
    server.on('request', app)

    wss.setMiddleware('onMessageFromWorker', (data) => {
        console.log(data)
    })

    wss.on('connection', (socket) => {
        console.log('user connected')
    })
}