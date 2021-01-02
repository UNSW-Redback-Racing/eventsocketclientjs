"use strict";
// All message related classes
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.OwnedMessage = exports.Message = void 0;
var Message_pb_1 = require("./Message_pb");
;
;
;
var Config;
(function (Config) {
    Config[Config["Forward"] = 0] = "Forward";
    Config[Config["Forwarded"] = 1] = "Forwarded";
    Config[Config["BroadcastAll"] = 2] = "BroadcastAll";
    Config[Config["BroadcastRoom"] = 3] = "BroadcastRoom";
    Config[Config["Broadcasted"] = 4] = "Broadcasted";
    Config[Config["CreateRoom"] = 5] = "CreateRoom";
    Config[Config["CreateRoomResponse"] = 6] = "CreateRoomResponse";
    Config[Config["JoinRoom"] = 7] = "JoinRoom";
    Config[Config["OnRoomJoined"] = 8] = "OnRoomJoined";
    Config[Config["None"] = 9] = "None";
})(Config || (Config = {}));
exports.Config = Config;
;
var MessageHeader = /** @class */ (function () {
    function MessageHeader(id, config, size) {
        this.id = id;
        this.config = config;
        this.size = size;
    }
    return MessageHeader;
}());
;
var Message = /** @class */ (function () {
    function Message(data, id, config) {
        this.messageImp = new Message_pb_1.Message();
        // Set the data, config and id to a default value if not available
        var conf = Config['None'];
        var payload = "";
        var eventid = 0;
        if (typeof config != 'undefined' && config != null) {
            conf = config;
        }
        if (typeof data != 'undefined' && data != null) {
            payload = data;
        }
        if (typeof id != 'undefined' && id != null) {
            eventid = id;
        }
        this.header = new MessageHeader(eventid, conf, payload.length);
        this.setData(payload);
        this.messageImp.getHeader().setId(eventid);
        this.messageImp.getHeader().setConfig(conf);
        this.messageImp.getHeader().setSize(payload.length);
    }
    Message.prototype.size = function () {
        return this.header.size;
    };
    Message.prototype.data = function (bytes) {
        if (bytes === void 0) { bytes = false; }
        if (bytes) {
            return this.messageImp.getBody();
        }
        return new TextDecoder().decode(this.messageImp.getBody());
    };
    Message.prototype.setData = function (data) {
        if (typeof data === 'string' || data instanceof String) {
            data = new TextEncoder().encode(data);
        }
        this.messageImp.setBody(data);
    };
    Message.prototype.setID = function (id) {
        this.header.id = id;
        this.messageImp.getHeader().setId(id);
    };
    Message.prototype.setConfig = function (config) {
        this.header.config = config;
        this.messageImp.getHeader().setConfig(config);
    };
    Message.prototype.ID = function () {
        return this.header.id;
    };
    Message.prototype.Config = function () {
        return this.header.config;
    };
    Message.prototype.serializeBinary = function () {
        return this.messageImp.serializeBinary();
    };
    Message.prototype.deserializeBinary = function (data) {
        this.messageImp = Message_pb_1.Message.deserializeBinary(data);
        var size = this.messageImp.getHeader().getSize();
        var id = this.messageImp.getHeader().getId();
        var config = this.messageImp.getHeader().getConfig();
        if (size === undefined || id === undefined || config === undefined) {
            throw Error('Invalid size, id or config');
        }
        this.header.size = size;
        this.header.id = id;
        this.header.config = config;
    };
    return Message;
}());
exports.Message = Message;
;
var OwnedMessage = /** @class */ (function () {
    function OwnedMessage(message, owner) {
        this.message = message;
        this.owner = owner;
    }
    return OwnedMessage;
}());
exports.OwnedMessage = OwnedMessage;
;
//# sourceMappingURL=Message.js.map