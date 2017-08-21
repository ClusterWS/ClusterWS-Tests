let socket;

beforeEach((done) => {
    socket = new ClusterWS({
        url: 'localhost',
        port: 80
    })
    done(null)
})

describe("Connect & Disconnect socket", () => {
    it('Should fire connect event', (done) => {
        socket.on('connect', () => {
            done(null)
            socket.disconnect()
        })
    })

    it('Should disconnect socket', (done) => {
        socket.on('connect', () => {
            socket.on('disconnect', () => {
                done(null)
            })
            socket.disconnect()
        })
    })
})

describe("Send & Receive events", () => {
    it('Should emit an event and get response', (done) => {
        socket.on('connect', () => {
            socket.on('Hello', (msg) => {
                chai.expect(msg).to.equal('world');
                done(null)
                socket.disconnect()
            })
            socket.send('Hello', 'world')
        })
    })

    it('Should send and get String', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.equal('string');
                done(null)
                socket.disconnect()
            })
            socket.send('Types', 'string')
        })
    })

    it('Should send and get Boolean', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.equal(true);
                done(null)
                socket.disconnect()
            })
            socket.send('Types', true)
        })
    })

    it('Should send and get Number', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.equal(4);
                done(null)
                socket.disconnect()
            })
            socket.send('Types', 4)
        })
    })

    it('Should send and get Array', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.eql([1, true, 'i am', null]);
                done(null)
                socket.disconnect()
            })
            socket.send('Types', [1, true, 'i am', null])
        })
    })

    it('Should send and get Object', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.eql({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] });
                done(null)
                socket.disconnect()
            })
            socket.send('Types', { m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true }, a: [1, 'true', null] })
        })
    })

    it('Should send and get Null', (done) => {
        socket.on('connect', () => {
            socket.on('Types', (msg) => {
                chai.expect(msg).to.eql(null);
                done(null)
                socket.disconnect()
            })
            socket.send('Types', null)
        })
    })
})


describe("Publish & Subscribe", () => {
    it('Should subscribe to channel and get message on publish', (done) => {
        socket.on('connect', () => {
            let myChannel = socket.subscribe('channel').watch((msg) => {
                chai.expect(msg).to.eql('done well')
                done(null)
                socket.disconnect()
            }).publish('done well')
        })
    })

    it('Get message which is published by another user', (done) => {
        let socket2 = new ClusterWS({
            url: 'localhost',
            port: 80
        })

        socket.on('connect', () => {
            let myChannel = socket.subscribe('channel2').watch((msg) => {
                chai.expect(msg).to.eql('got it')
                done(null)
                socket.disconnect()
            })
        })

        socket2.on('connect', () => {
            socket2.subscribe('channel2').publish('got it')
            socket2.disconnect()
        })
    })
    it('Get message which is published by server', (done) => {
        socket.on('connect', () => {
            let myChannel = socket.subscribe('from server').watch((msg) => {
                chai.expect(msg).to.eql('i am server')
                done(null)
                socket.disconnect()
            })
        })
    })
})

