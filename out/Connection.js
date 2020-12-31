"use strict";
// A connection class that handles asynchronous operations and transmission of message objects
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
var WebSocket = require("isomorphic-ws");
var Message_1 = require("./Message");
// Util used to convert string to arraybuffer
function stringToAB(str) {
    var buf = new ArrayBuffer(str.length); // 1 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
// Util used to convert array buffer to string
function ABToString(arr) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(arr)));
}
var Connection = /** @class */ (function () {
    function Connection() {
        this.eventCallbacks = new Map();
    }
    Connection.prototype.connectToServer = function (host, port) {
        var _this = this;
        // Create a websocket 
        this.ws = new WebSocket("ws://" + host + ":" + port);
        this.ws.binaryType = "arraybuffer";
        this.ws.onopen = function (ev) {
            _this.configure();
            if (_this.OnConnect) {
                _this.OnConnect(ev);
            }
        };
    };
    // Setup the required websocket callbacks
    Connection.prototype.configure = function () {
        var _this = this;
        if (this.ws === undefined || this.ws === null) {
            return;
        }
        this.ws.onmessage = function (ev) {
            var _a;
            // Message object to contain data
            var message = new Message_1.Message();
            message.deserializeBinary(new Uint8Array(stringToAB(ev.data.toString())));
            // Check if the message is broadcasted
            if (message.Config() == Message_1.Config.Broadcasted && _this.OnBroadCast) {
                // Get the forwarder id
                var data = message.data();
                if (data) {
                    var buf = stringToAB(data);
                    var id = new Uint16Array(buf.slice(-2))[0];
                    var remData = buf.slice(0, buf.byteLength - 2);
                    message.setData(ABToString(remData));
                    _this.OnBroadCast(message, id);
                }
            }
            // Check if that message is a create room response
            else if (message.Config() == Message_1.Config.CreateRoomResponse && _this.OnRoomCreated) {
                var data = message.data();
                if (data)
                    _this.OnRoomCreated(parseInt(data));
            }
            // Check if the message is a room joining response
            else if (message.Config() == Message_1.Config.OnRoomJoined && _this.OnRoomJoined) {
                _this.OnRoomJoined(message);
            }
            // Check if the message is forwarded
            else if (message.Config() == Message_1.Config.Forwarded && _this.OnForwarded) {
                // Get the forwarder id
                var data = message.data();
                if (data) {
                    var buf = stringToAB(data);
                    console.log(buf);
                    var id = new Uint16Array(buf.slice(-2))[0];
                    var remData = buf.slice(0, buf.byteLength - 2);
                    message.setData(ABToString(remData));
                    _this.OnForwarded(message, id);
                }
            }
            // find if there are any event callbacks assigned for this event
            else if (_this.eventCallbacks.get(message.ID()) != undefined
                && message.ID() != undefined) {
                (_a = _this.eventCallbacks.get(message.ID())) === null || _a === void 0 ? void 0 : _a(message);
            }
            else if (!(typeof _this.OnMessage === 'undefined' || _this.OnMessage === null)) {
                _this.OnMessage(message);
            }
        };
        this.ws.onclose = function (ev) {
            if (!(typeof _this.OnClose === 'undefined' || _this.OnMessage === null)) {
                _this.OnClose(ev);
            }
        };
    };
    Connection.prototype.OnEvent = function (event, callback) {
        this.eventCallbacks.set(event, callback);
    };
    Connection.prototype.send = function (message) {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(message.serializeBinary());
    };
    Connection.prototype.broadcast = function (message) {
        message.setConfig(Message_1.Config.BroadcastAll);
        this.send(message);
    };
    Connection.prototype.forward = function (message, to) {
        var payload = message.data();
        if (!payload) {
            payload = "";
        }
        // Combine data payload with the recp id
        var buf = new ArrayBuffer(4);
        var view = new Uint32Array(buf);
        view[0] = to;
        message.setData(payload + ABToString(buf));
        message.setConfig(Message_1.Config.Forward);
        this.send(message);
    };
    /**
     * Broadcast a message to all clients in room with roomid
     */
    Connection.prototype.broadcastRoom = function (message, roomid) {
        var payload = message.data();
        if (!payload) {
            payload = "";
        }
        // Combine data payload with recp id
        var buf = new ArrayBuffer(4);
        var view = new Uint32Array(buf);
        view[0] = roomid;
        message.setData(payload + ABToString(buf));
        message.setConfig(Message_1.Config.BroadcastRoom);
        this.send(message);
    };
    /**
     * Create a room that other people can join
     */
    Connection.prototype.createRoom = function () {
        var msg = new Message_1.Message();
        msg.setConfig(Message_1.Config.CreateRoom);
        this.send(msg);
    };
    /**
     * Join a room that is created
     */
    Connection.prototype.joinRoom = function (roomid) {
        var msg = new Message_1.Message(roomid.toString());
        msg.setConfig(Message_1.Config.JoinRoom);
    };
    Connection.prototype.isConnected = function () {
        var _a;
        if (!this.ws || !((_a = this.ws) === null || _a === void 0 ? void 0 : _a.OPEN)) {
            return false;
        }
        return true;
    };
    Connection.prototype.close = function () {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
    };
    return Connection;
}());
exports.Connection = Connection;
;
//# sourceMappingURL=Connection.js.map