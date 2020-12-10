"use strict";
// A connection class that handles asynchronous operations and transmission of message objects
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
var Message_1 = require("./Message");
var Connection = /** @class */ (function () {
    function Connection() {
    }
    Connection.prototype.connectToServer = function (host, port) {
        var _this = this;
        // Create a websocket 
        this.ws = new WebSocket("ws://" + host + ":" + port);
        this.ws.onopen = function (ev) {
            _this.configure();
        };
    };
    // Setup the required websocket callbacks
    Connection.prototype.configure = function () {
        var _this = this;
        this.ws.onmessage = function (ev) {
            // Message object to contain data
            var message = new Message_1.Message();
            // get the data from the payload
            message.deserializeBinary(ev.data);
            // call the on message function if it exists
            if (!(typeof _this.OnMessage === 'undefined' || _this.OnMessage === null)) {
                _this.OnMessage(message);
            }
        };
        this.ws.onclose = function (ev) {
            if (!(typeof _this.OnClose === 'undefined' || _this.OnMessage === null)) {
                _this.OnClose(ev);
            }
        };
    };
    return Connection;
}());
exports.Connection = Connection;
;
__exportStar(require("./Message"), exports);
//# sourceMappingURL=Connection.js.map