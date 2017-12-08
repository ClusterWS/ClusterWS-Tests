let ClusterWS = require('./Server/index').ClusterWS
let fs = require('fs')

let Koa = require('koa')
let serve = require('koa-static')
let compress = require('koa-compress')

let cws = new ClusterWS({
    port: 443,
    workers: 2,
    worker: Worker,
    pingInterval: 100,
    useBinary: true,
    machineScale: {
        master: true,
        port: 8081,
    },
    secureProtocolOptions: {
        key: fs.readFileSync('./ssl/server-key.pem'),
        cert: fs.readFileSync('./ssl/server-cert.pem')
    }
})

function Worker() {
    let server = this.httpsServer
    let socketServer = this.socketServer

    let app = new Koa()
    app.use(compress({
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
    }))
    app.use(serve(__dirname + '/Client'))

    server.on('request', app.callback())
    socketServer.setMiddleware('onsubscribe', (socket, channel, next) => {
        next(true)
    })
    socketServer.on('verifyConnection', (info, callback) => {
        callback(true)
    })
    socketServer.on('connection', (socket) => {
        socket.on('String', (data) => {
            socket.send('String', data)
        })
    })
}