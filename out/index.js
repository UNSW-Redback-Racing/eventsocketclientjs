"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var conn = require("./Connection");
var EventTypes;
(function (EventTypes) {
    EventTypes[EventTypes["Hello"] = 0] = "Hello";
    EventTypes[EventTypes["World"] = 1] = "World";
    EventTypes[EventTypes["RandomNumber"] = 2] = "RandomNumber";
})(EventTypes || (EventTypes = {}));
;
var connection = new conn.Connection();
connection.OnMessage = function (message) {
    document.body.innerHTML = "Message Received: " + message.data();
};
connection.connectToServer("localhost", 60000);
document.body.innerHTML = "Connected!";
//# sourceMappingURL=index.js.map