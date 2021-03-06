var ClusterWS = function () {
  "use strict";
  function t(t) {
    return console.log(t);
  }
  var e = function () {
    function e(t, e) {
      this.name = e, this.socket = t, this.subscribe();
    }
    return e.prototype.watch = function (e) {
      return "[object Function]" !== {}.toString.call(e) ? t("Listener must be a function") : (this.listener = e,
        this);
    }, e.prototype.publish = function (t) {
      return this.socket.send(this.name, t, "publish"), this;
    }, e.prototype.unsubscribe = function () {
      this.socket.send("unsubscribe", this.name, "system"), this.socket.channels[this.name] = null;
    }, e.prototype.onMessage = function (t) {
      this.listener && this.listener.call(null, t);
    }, e.prototype.subscribe = function () {
      this.socket.send("subscribe", this.name, "system");
    }, e;
  }(), n = function () {
    function e() {
      this.events = {};
    }
    return e.prototype.on = function (e, n) {
      if ("[object Function]" !== {}.toString.call(n)) return t("Listener must be a function");
      this.events[e] = n;
    }, e.prototype.emit = function (t) {
      for (var e, n = [], o = 1; o < arguments.length; o++) n[o - 1] = arguments[o];
      this.events[t] && (e = this.events)[t].apply(e, n);
    }, e.prototype.removeAllEvents = function () {
      this.events = {};
    }, e;
  }();
  function o(t) {
    for (var e = t.length, n = new Uint8Array(e), o = 0; o < e; o++) n[o] = t.charCodeAt(o);
    return n.buffer;
  }
  function s(t, e, n) {
    var o = {
      emit: {
        "#": ["e", t, e]
      },
      publish: {
        "#": ["p", t, e]
      },
      system: {
        subscribe: {
          "#": ["s", "s", e]
        },
        unsubscribe: {
          "#": ["s", "u", e]
        }
      }
    };
    return JSON.stringify("system" === n ? o[n][t] : o[n]);
  }
  return function () {
    function i(e) {
      return this.events = new n(), this.isAlive = !0, this.channels = {}, this.useBinary = !1,
        this.reconnectionAttempted = 0, e.url ? (this.options = {
          url: e.url,
          autoReconnect: e.autoReconnect || !1,
          autoReconnectOptions: e.autoReconnectOptions ? {
            attempts: e.autoReconnectOptions.attempts || 0,
            minInterval: e.autoReconnectOptions.minInterval || 1e3,
            maxInterval: e.autoReconnectOptions.maxInterval || 5e3
          } : {
              attempts: 0,
              minInterval: 1e3,
              maxInterval: 5e3
            }
        }, this.options.autoReconnectOptions.minInterval > this.options.autoReconnectOptions.maxInterval ? t("minInterval option can not be more than maxInterval option") : void this.create()) : t("Url must be provided and it must be a string");
    }
    return i.prototype.send = function (t, e, n) {
      void 0 === n && (n = "emit"), this.websocket.send(this.useBinary ? o(s(t, e, n)) : s(t, e, n));
    }, i.prototype.on = function (t, e) {
      this.events.on(t, e);
    }, i.prototype.disconnect = function (t, e) {
      this.websocket.close(t || 1e3, e);
    }, i.prototype.getState = function () {
      return this.websocket.readyState;
    }, i.prototype.subscribe = function (t) {
      return this.channels[t] ? this.channels[t] : this.channels[t] = new e(this, t);
    }, i.prototype.getChannelByName = function (t) {
      return this.channels[t];
    }, i.prototype.ping = function () {
      var t = this;
      clearTimeout(this.pingTimeout), this.pingTimeout = setTimeout(function () {
        return t.disconnect(4001, "Did not get pings");
      }, 1.2 * this.pingInterval);
    }, i.prototype.create = function () {
      var e = this, n = window.MozWebSocket || window.WebSocket;
      this.websocket = new n(this.options.url), this.websocket.binaryType = "arraybuffer",
        this.websocket.onopen = function () {
          e.reconnectionAttempted = 0;
          for (var t = 0, n = Object.keys(e.channels), o = n.length; t < o; t++) e.channels[n[t]] && e.channels[n[t]].subscribe();
        }, this.websocket.onclose = function (t) {
          if (clearTimeout(e.pingTimeout), e.events.emit("disconnect", t.code, t.reason),
            e.options.autoReconnect && 1e3 !== t.code && (0 === e.options.autoReconnectOptions.attempts || e.reconnectionAttempted < e.options.autoReconnectOptions.attempts)) e.websocket.readyState === e.websocket.CLOSED ? (e.reconnectionAttempted++ ,
              e.websocket = void 0, setTimeout(function () {
                return e.create();
              }, Math.floor(Math.random() * (e.options.autoReconnectOptions.maxInterval - e.options.autoReconnectOptions.minInterval + 1)))) : console.log("Some thing wrong with close event please contact developer"); else {
            e.events.removeAllEvents();
            for (var n = 0, o = Object.keys(e), s = o.length; n < s; n++) e[o[n]] = null;
          }
        }, this.websocket.onmessage = function (n) {
          var s = "string" != typeof n.data ? String.fromCharCode.apply(null, new Uint8Array(n.data)) : n.data;
          if ("9" === s) return e.websocket.send(o("A")), e.ping();
          try {
            s = JSON.parse(s), function (t, e) {
              var n = {
                e: function () {
                  return t.events.emit(e["#"][1], e["#"][2]);
                },
                p: function () {
                  return t.channels[e["#"][1]] && t.channels[e["#"][1]].onMessage(e["#"][2]);
                },
                s: {
                  c: function () {
                    t.useBinary = e["#"][2].binary, t.pingInterval = e["#"][2].ping, t.ping(), t.events.emit("connect");
                  }
                }
              };
              "s" === e["#"][0] ? n[e["#"][0]][e["#"][1]] && n[e["#"][0]][e["#"][1]].call(null) : n[e["#"][0]] && n[e["#"][0]].call(null);
            }(e, s);
          } catch (e) {
            return t(e);
          }
        }, this.websocket.onerror = function (t) {
          return e.events.emit("error", t);
        };
    }, i;
  }();
}();
