"use strict";
// All message related classes
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnedMessage = exports.Message = void 0;
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
;
var MessageHeader = /** @class */ (function () {
    function MessageHeader() {
    }
    return MessageHeader;
}());
;
var Message = /** @class */ (function () {
    function Message(data, id, config) {
        //check if id is a valid enum
        if (this.Events[id] === 'undefined') {
            throw new RangeError("id is not a valid within enum");
        }
        this.messageImp = new Message_pb_1.Message();
        if (!(typeof data === 'undefined' || data === null)) {
            this.messageImp.setBody(data);
        }
        // Set the id if available
        if (typeof id === 'undefined' || id === null) {
            this.messageImp.getHeader().setId(id);
        }
        // Set the config to a default value if not available
        if (typeof config === 'undefined' || config === null) {
            this.messageImp.getHeader().setConfig(Config['None']);
        }
        else {
            this.messageImp.getHeader().setConfig(config);
        }
        this.header.size = Object.keys(data).length;
        this.messageImp.getHeader().setSize(this.header.size);
    }
    Message.prototype.size = function () {
        return this.header.size;
    };
    Message.prototype.data = function () {
        return this.messageImp.getBody();
    };
    Message.prototype.setID = function (id) {
        this.header.id = id;
        this.messageImp.getHeader().setId(id);
    };
    Message.prototype.setConfig = function (config) {
        this.header.config = config;
        this.messageImp.getHeader().setConfig(config);
    };
    Message.prototype.getID = function () {
        return this.header.id;
    };
    Message.prototype.getConfig = function () {
        return this.header.config;
    };
    Message.prototype.serializeBinary = function () {
        return this.messageImp.serializeBinary();
    };
    Message.prototype.deserializeBinary = function (data) {
        this.messageImp = Message_pb_1.Message.deserializeBinary(data);
        this.header.size = this.messageImp.getHeader().getSize();
        this.header.id = this.messageImp.getHeader().getId();
        this.header.config = this.messageImp.getHeader().getConfig();
    };
    return Message;
}());
exports.Message = Message;
;
var OwnedMessage = /** @class */ (function () {
    function OwnedMessage() {
    }
    return OwnedMessage;
}());
exports.OwnedMessage = OwnedMessage;
;
//# sourceMappingURL=Message.js.map