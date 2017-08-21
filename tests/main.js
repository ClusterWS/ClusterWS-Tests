let socket = new ClusterWS({
    url: 'localhost',
    port: 80
})

let myChannel
socket.on('hello', (data)=>{
    console.log(data)
})
socket.on('connect', ()=>{
    socket.send('hello', 'world33')

    myChannel = socket.subscribe('channel').watch((data)=>{
        console.log(data)
    }).publish('my name is Dima')
    
})

function publish(){
    myChannel.publish('I am bulishing')
}

function unsubscribe(){
    myChannel.unsubscribe()
}