describe('Connect, Disconenct & Reconnect', () => {
    it('Should fire connect event on Connection', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })
        socket.on('connect', () => {
            done(null)
            socket.disconnect()
        })
    })

    it('Should Reconnect on lost connection or wrong code', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080,
            autoReconnect: true,
            reconnectionIntervalMin: 10,
            reconnectionIntervalMax: 20
        })
        let connected = false
        socket.on('connect', () => {
            if (connected) done(null)
            if (!connected) socket.disconnect(3000, 'Some thing wrong')
            if (connected) socket.disconnect()
            connected = true
        })
    })

    it('Should Disconnect', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })
        socket.on('connect', () => {
            socket.disconnect()
        })
        socket.on('disconnect', () => {
            done(null)
        })
    })
})

describe('Ping (Stay Alive)', () => {
    it('Should stay alive on ping', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })

        let timer
        let pass = false
        socket.on('connect', () => { })
        socket.on('disconnect', () => {
            clearTimeout(timer)
            if (!pass) done('Ping fail')
        })

        timer = setTimeout(() => {
            pass = true
            done(null)
            socket.disconnect()
        }, 1500)
    })

    it('Should disconnect on not sending ping', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })

        let timer
        let fail = false
        socket.send = () => { }
        socket.on('connect', () => { })
        socket.on('disconnect', () => {
            clearTimeout(timer)
            if (!fail) done(null)
        })

        timer = setTimeout(() => {
            fail = true
            done('Server did not disconnect on ping lost')
            socket.disconnect()
        }, 1500)
    })
})

describe('Send events & data', () => {
    let socket
    before((done) => {
        socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })
        socket.on('connect', () => { done(null) })
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

describe('Channels', () => {
    let socket
    before((done) => {
        socket = new ClusterWS({
            url: 'localhost',
            port: 8080
        })
        socket.on('connect', () => { done(null) })
    })

    it('Should send and get String', (done) => {
        socket.subscribe('String').watch((msg) => {
            chai.expect(msg).to.eql('String')
            done(null)
        }).publish('String')
    })
    it('Should send and get Number', (done) => {
        socket.subscribe('Number').watch((msg) => {
            chai.expect(msg).to.eql(25)
            done(null)
        }).publish(25)
    })
    it('Should send and get Boolean', (done) => {
        socket.subscribe('Boolean').watch((msg) => {
            chai.expect(msg).to.eql(false)
            done(null)
        }).publish(false)
    })
    it('Should send and get Array', (done) => {
        socket.subscribe('Array').watch((msg) => {
            chai.expect(msg).to.eql([1, true, 'i am', null])
            done(null)
        }).publish([1, true, 'i am', null])
    })
    it('Should send and get Object', (done) => {
        socket.subscribe('Object').watch((msg) => {
            chai.expect(msg).to.eql({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] })
            done(null)
        }).publish({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] })
    })


    it('Should get message which is published by another user', (done) => {
        let socket2 = new ClusterWS({
            url: 'localhost',
            port: 8080
        })
        socket.subscribe('channel2').watch((msg) => {
            chai.expect(msg).to.eql('got message')
            done(null)
        })
        socket2.on('connect', () => {
            socket2.subscribe('channel2').publish('got message')
            socket2.disconnect()
        })
    })


    it('Should get message which is published by server', (done) => {
        socket.subscribe('hello').watch((msg) => {
            chai.expect(msg).to.eql('got message')
            done(null)
        })
        socket.send('publish', 'got message')
    })

    it('Should unsubscribe from channel', (done) => {
        let timeout
        let channle = socket.subscribe('check').watch((msg) => {
            clearTimeout(timeout)
            done('Did not unsubscribe')
        })
        channle.unsubscribe()
        channle.publish('Hello')
        timeout = setTimeout(() => {
            done(null)
            socket.disconnect()
        }, 30)
    })

    it('Should resubscribe on reconnection', (done) => {
        let socket = new ClusterWS({
            url: 'localhost',
            port: 8080,
            autoReconnect: true,
            reconnectionIntervalMin: 10,
            reconnectionIntervalMax: 20
        })

        let channel
        let connected = false
        socket.on('connect', () => {
            if (connected) {
                channel.publish('reconnected')
                return
            }
            connected = true
            channel = socket.subscribe('reconnection').watch((msg) => {
                chai.expect(msg).to.eql('reconnected')
                done(null)
            })
            socket.disconnect(3000)
        })
    })
})