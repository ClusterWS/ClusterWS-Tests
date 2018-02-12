const express = require('express')
const ClusterWS = require('./index')
const path = require("path")
const fs = require('fs')

new ClusterWS({
    worker: Worker,
    port: 8001,
    brokersPorts: [8002],
    horizontalScaleOptions: {
        masterOptions: {
            port: 8080,
            tlsOptions: {
                key: fs.readFileSync('./ssl/server-key.pem'),
                cert: fs.readFileSync('./ssl/server-cert.pem')
            }
        },
        brokersUrls: [
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
    app.get('/', (req, res, next) => res.sendFile(path.join(__dirname + '/public/index1.html')))

    server.on('request', app)

    wss.on('connection', (socket) => {
        console.log('user connected')
    })
}
