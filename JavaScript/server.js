let ClusterWS = require('./Server/index').ClusterWS

let Koa = require('koa')
let serve = require('koa-static')
let compress = require('koa-compress')

let cws = new ClusterWS({
    port: 8080,
    workers: 2,
    worker: Worker,
    pingInterval: 300
})

function Worker() {
    let httpServer = this.httpServer
    let socketServer = this.socketServer

    let app = new Koa()
    app.use(compress({
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
    }))
    app.use(serve(__dirname + '/Client'))

    httpServer.on('request', app.callback())

    socketServer.on('connection', (socket) => {

        socket.on('String', (data) => {
            socket.send('String', data)
        })
        socket.on('Boolean', (data) => {
            socket.send('Boolean', data)
        })
        socket.on('Number', (data) => {
            socket.send('Number', data)
        })
        socket.on('Array', (data) => {
            socket.send('Array', data)
        })
        socket.on('Object', (data) => {
            socket.send('Object', data)
        })
        socket.on('Null', (data) => {
            socket.send('Null', data)
        })

        socket.on('publish', (data)=>{
            socketServer.publish('hello', data)
        })
    })
}