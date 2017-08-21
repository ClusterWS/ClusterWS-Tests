const ClusterWS = require('./ClusterWS-server/index').ClusterWS
const express = require('express')
const path = require('path')

let cws = new ClusterWS({
    worker: Worker,
    workers: 2
})

function Worker() {
    let httpServer = this.httpServer
    let socketServer = this.socketServer

    let app = express()
    app.use('/', express.static(path.join(__dirname + '/tests')))

    httpServer.on('request', app)

    socketServer.on('connection', (socket)=>{
        setTimeout(()=>{
            socketServer.publish('from server', 'i am server')
        }, 50)
        socket.on('Hello', (data)=>{
            socket.send('Hello', data)
        })

        socket.on('String', (data)=>{
            socket.send('String', data)
        })
        socket.on('Boolean', (data)=>{
            socket.send('Boolean', data)
        })
        socket.on('Number', (data)=>{
            socket.send('Number', data)
        })
        socket.on('Array', (data)=>{
            socket.send('Array', data)
        })
        socket.on('Object', (data)=>{
            socket.send('Object', data)
        })
        socket.on('Null', (data)=>{
            socket.send('Null', data)
        })
    })
}