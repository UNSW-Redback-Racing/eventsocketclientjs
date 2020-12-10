"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// An implementation of the EventSocket API in javascript
var websocket = require('ws');
var EventSocket = /** @class */ (function () {
    function EventSocket(ws, default_callback) {
        var _this = this;
        this._eventCallbacks = new Map();
        this._default_callback = default_callback;
        this._ws = ws;
        this._ws.onmessage = function (event) {
            _this.event_forward(_this, event.data);
        };
    }
    // The function that envokes the appropriate 
    // Callback when new payload is received
    EventSocket.prototype.event_forward = function (eventSocket, payload) {
        var _a;
        try {
            var payloadJSON = JSON.parse(payload);
            // If the event name is not found, call default callback
            if (eventSocket._eventCallbacks.get(payloadJSON.eventName)) {
                (_a = eventSocket._eventCallbacks.get(payloadJSON.eventName)) === null || _a === void 0 ? void 0 : _a(payloadJSON.payload);
            }
            else {
                eventSocket._default_callback(payloadJSON.payload);
            }
        }
        catch (e) {
            // Call the default callback
            eventSocket._default_callback(payload);
        }
    };
    EventSocket.prototype.onEvent = function (event, callback) {
        this._eventCallbacks.set(event, callback);
    };
    EventSocket.prototype.emitEvent = function (event, payload) {
        var payloadJSON = {
            eventName: event,
            payload: (typeof payload == "string") ? payload : JSON.stringify(payload)
        };
        this._ws.send(JSON.stringify(payloadJSON));
    };
    return EventSocket;
}());
exports.default = EventSocket;
//# sourceMappingURL=EventSocket.js.map