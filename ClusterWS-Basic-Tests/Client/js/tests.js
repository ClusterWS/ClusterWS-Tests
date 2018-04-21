let PROTOCOL = 'ws'
let PORT = 8080;
let HOST = 'localhost';

describe('Connect, Disconenct & Reconnect', function () {
  it('Should fire connect event on Connection', function (done) {
    var socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    socket.on('connect', function () {
      done(null)
      socket.disconnect()
    })
  })

  it('Should Disconnect', function (done) {
    var socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    socket.on('connect', function () {
      socket.disconnect()
    })
    socket.on('disconnect', function () {
      done(null)
    })
  })

  it('Should reconnect on lost connection', function (done) {
    var socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT,
      autoReconnect: true,
      autoReconnectOptions: {
        minInterval: 10,
        maxInterval: 20
      }
    })
    var connected = false
    socket.on('connect', function () {
      if (connected) {
        done(null)
        socket.disconnect()
      } else {
        connected = true
        socket.disconnect(4010, 'Some thing wrong')
      }
    })
  })
})

describe('Ping & Pong', function () {
  it('Should stay alive', function (done) {
    var socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    var passed = false
    var timer = setTimeout(function () {
      passed = true
      done(null)
      socket.disconnect()
    }, 1900)
    socket.on('connect', function () { })
    socket.on('disconnect', function () {
      clearTimeout(timer)
      if (!passed) done('Ping fail')
    })
  })

  it('Should disconnect with out ping', function (done) {
    var socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    var passed = true
    var timer = setTimeout(function () {
      passed = false
      done('Fail to diconnect')
      socket.disconnect()
    }, 1900)
    socket.websocket.send = function () { }
    socket.on('connect', function () { })
    socket.on('disconnect', function () {
      clearTimeout(timer)
      if (passed) done(null)
    })
  })
})

describe('Send Events & Data', function () {
  var socket
  before(function (done) {
    socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    socket.on('connect', function () { done(null) })
  })
  it('Should send and reveive String', function (done) {
    socket.on('String', function (message) {
      chai.expect(message).to.equal('string')
      done(null)
    })
    socket.send('String', 'string')
  })
  it('Should send and reveive Boolean', function (done) {
    socket.on('Boolean', function (message) {
      chai.expect(message).to.equal(true)
      done(null)
    })
    socket.send('Boolean', true)
  })
  it('Should send and reveive Number', function (done) {
    socket.on('Number', function (message) {
      chai.expect(message).to.equal(4)
      done(null)
    })
    socket.send('Number', 4)
  })
  it('Should send and reveive Array', function (done) {
    socket.on('Array', function (message) {
      chai.expect(message).to.eql([1, true, 'string', null, { world: true }])
      done(null)
    })
    socket.send('Array', [1, true, 'string', null, { world: true }])
  })
  it('Should send and reveive Object', function (done) {
    socket.on('Object', function (message) {
      chai.expect(message).to.eql({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true, a: null }, a: [1, true, 'string', null, { world: true }] })
      done(null)
    })
    socket.send('Object', { m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true, a: null }, a: [1, true, 'string', null, { world: true }] })
  })
  it('Should send and reveive Null', function (done) {
    socket.on('Null', function (message) {
      chai.expect(message).to.equal(null)
      done(null)
    })
    socket.send('Null', null)
  })
  after(function () {
    socket.disconnect()
  })
})

describe('Pub/Sub', function () {
  var socket
  before(function (done) {
    socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    socket.on('connect', function () { done(null) })
  })

  it('Should send and reveive String', function (done) {
    socket.subscribe('String').watch(function (message) {
      chai.expect(message).to.equal('string')
      done(null)
    }).publish('string')
  })
  it('Should send and reveive Number', function (done) {
    socket.subscribe('Number').watch(function (message) {
      chai.expect(message).to.equal(10)
      done(null)
    }).publish(10)
  })
  it('Should send and reveive Boolean', function (done) {
    socket.subscribe('Boolean').watch(function (message) {
      chai.expect(message).to.equal(false)
      done(null)
    }).publish(false)
  })
  it('Should send and reveive Array', function (done) {
    socket.subscribe('Array').watch(function (message) {
      chai.expect(message).to.eql([1, true, 'string', null, { world: true }])
      done(null)
    }).publish([1, true, 'string', null, { world: true }])
  })
  it('Should send and reveive Object', function (done) {
    socket.subscribe('Object').watch(function (message) {
      chai.expect(message).to.eql({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true, a: null }, a: [1, true, 'string', null, { world: true }] })
      done(null)
    }).publish({ m: 15, s: 'hello', f: false, n: null, l: { m: '5', s: true, a: null }, a: [1, true, 'string', null, { world: true }] })
  })
  it('Should send and reveive Null', function (done) {
    socket.subscribe('Null').watch(function (message) {
      chai.expect(message).to.eql(null)
      done(null)
    }).publish(null)
  })
  after(function () {
    socket.disconnect()
  })
})

describe('Channel\'s Functionality', function () {
  var socket
  before(function (done) {
    socket = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT
    })
    socket.on('connect', function () { done(null) })
  })

  it('Should get message published by another user', function (done) {
    socket.subscribe('Message').watch(function (message) {
      chai.expect(message).to.eql('message from another user')
      done(null)
    })
    var socket2 = new ClusterWS({ url: PROTOCOL + '://' + HOST + ':' + PORT })
    socket2.on('connect', function () {
      socket2.subscribe('Message').publish('message from another user')
      socket2.disconnect()
    })
  })
  it('Should receive message from the Server', function (done) {
    socket.subscribe('Messag From Server').watch(function (message) {
      chai.expect(message).to.eql('I am from the server')
      done(null)
    })
    socket.send('publish', 'I am from the server')
  })
  it('Should unsibscribe from the channel', function (done) {
    var isSubscribed = false
    var channel = socket.subscribe('UnsubscribeChannel').watch(function (message) {
      if (message === 0) {
        isSubscribed = true
      }
      if (message === 1) {
        isSubscribed = false
      }
    }).publish(0)

    setTimeout(function () {
      channel.unsubscribe()
      channel.publish(1)
      setTimeout(function () {
        if (!isSubscribed) {
          done('Did not subscribe')
        } else {
          done(null)
        }
      }, 15)
    }, 15)
  })
  it('Check for getChannelByName method', function (done) {
    var works = false
    socket.subscribe('getChannelByName').watch(function (message) {
      if (message === 1) {
        works = true
      }
    })
    socket.getChannelByName('getChannelByName').publish(1)
    setTimeout(function () {
      if (works) {
        done(null)
        socket.disconnect()
      } else {
        done('getChannelByName does not work')
      }
    }, 15)
  })
  it('Should resubscribe on reconnection', function (done) {
    var socket2 = new ClusterWS({
      url: PROTOCOL + '://' + HOST + ':' + PORT,
      autoReconnect: true,
      autoReconnectOptions: {
        minInterval: 10,
        maxInterval: 20
      }
    })
    var channel
    var connected = false
    socket2.on('connect', function () {
      if (!connected) {
        channel = socket2.subscribe('TestReconnection')
        channel.watch(function (message) {
          chai.expect(message).to.eql('Channel is reconnected')
          done(null)
        })
        connected = true
        socket2.disconnect(3000)
      } else {
        channel.publish('Channel is reconnected')
        setTimeout(function () {
          socket2.disconnect()
        }, 20)
      }
    })
  })
})