
/* 
    Test connection to tje server and right disconection from the server
    make sure that reconnection will work on lost connection
*/
describe("Connect & Disconnect socket", () => {
    let socket
    before(() => {
        socket = new ClusterWS({
            url: 'localhost',
            port: 80
        })
    })
    it('Should fire connect event', (done) => {
        socket.on('connect', () => {
            done(null)
        })
    })

    it('Should disconnect socket', (done) => {
        socket.on('disconnect', () => {
            done(null)
        })
        socket.disconnect()
    })

    it('Should reconnect on lost connection', (done) => {
        let socket2 = new ClusterWS({
            url: 'localhost',
            port: 80,
            autoReconnect: true,
            reconnectionInterval: 20
        })
        let i = 0
        socket2.on('connect', () => {
            i++
            if (i > 1) return (() => {
                done(null)
                socket2.disconnect()
            })()
            socket2.send('fail connection')
        })
    })
})

/* Make sure that send and recive events are working */

describe("Send & Receive events", () => {
    let socket
    before(() => {
        socket = new ClusterWS({
            url: 'localhost',
            port: 80
        })
    })
    it('Should emit an event and get response', (done) => {
        socket.on('connect', () => {
            socket.on('Hello', (msg) => {
                chai.expect(msg).to.equal('world');
                done(null)
            })
            socket.send('Hello', 'world')
        })
    })

    it('Should send and get String', (done) => {
        socket.on('String', (msg) => {
            chai.expect(msg).to.equal('string');
            done(null)
        })
        socket.send('String', 'string')
    })

    it('Should send and get Boolean', (done) => {
        socket.on('Boolean', (msg) => {
            chai.expect(msg).to.equal(true);
            done(null)
        })
        socket.send('Boolean', true)
    })

    it('Should send and get Number', (done) => {
        socket.on('Number', (msg) => {
            chai.expect(msg).to.equal(4);
            done(null)
        })
        socket.send('Number', 4)
    })

    it('Should send and get Array', (done) => {
        socket.on('Array', (msg) => {
            chai.expect(msg).to.eql([1, true, 'i am', null]);
            done(null)
        })
        socket.send('Array', [1, true, 'i am', null])
    })

    it('Should send and get Object', (done) => {
        socket.on('Object', (msg) => {
            chai.expect(msg).to.eql({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] });
            done(null)
        })
        socket.send('Object', { m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] })
    })
    it('Should send and get Null', (done) => {
        socket.on('Null', (msg) => {
            chai.expect(msg).to.eql(null);
            done(null)
            socket.disconnect()
        })
        socket.send('Null', null)
    })
})


/* Make sure that publish and subscribe events are working */

describe("Publish & Subscribe", () => {
    let socket
    before(() => {
        socket = new ClusterWS({
            url: 'localhost',
            port: 80
        })
    })
    it('Should subscribe to channel and get message on publish', (done) => {
        socket.on('connect', () => {
            socket.subscribe('channel').watch((msg) => {
                chai.expect(msg).to.eql('done well')
                done(null)
            }).publish('done well')
        })
    })

    it('Get message which is published by another user', (done) => {
        let socket2 = new ClusterWS({
            url: 'localhost',
            port: 80
        })

        socket.subscribe('channel2').watch((msg) => {
            chai.expect(msg).to.eql('got it')
            done(null)
        })

        socket2.on('connect', () => {
            socket2.subscribe('channel2').publish('got it')
            socket2.disconnect()
        })
    })
    it('Get message which is published by server', (done) => {
        let i = 0
        socket.subscribe('from server').watch((msg) => {
            if (i < 1) {
                chai.expect(msg).to.eql('i am server')
                done(null)
            }
            i++
        })
    })
    it('Should unsubscribe from the channel', (done) => {
        let myChannel3 = socket.subscribe('channel3').watch((msg) => {
            chai.expect(msg).to.eql('fail')
        })
        myChannel3.unsubscribe()
        myChannel3.publish('hello')
        setTimeout(() => {
            done(null)
            socket.disconnect()
        }, 20)
    })
})

