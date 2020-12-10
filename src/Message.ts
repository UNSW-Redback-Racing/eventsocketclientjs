// All message related classes

import { Message as MessageImp } from './Message_pb';

// Contains the size and id (eventid) of messages
interface MessageHeader<T> {};

// Contains the payload and header
interface Message<T> {};

// A message that is owned by a Connection
interface OwnedMessage<T> {};

import { Connection } from './Connection';
import { EnumType } from 'typescript';

enum Config {
    Forward, Forwarded, BroadcastAll, BroadcastRoom, Broadcasted,
    CreateRoom, CreateRoomResponse, JoinRoom, OnRoomJoined,
    None
};

class MessageHeader<T> {
    id: number;
    config: Config;
    size: number;
};

class Message<T> {
    private header: MessageHeader<T>;
    private messageImp: MessageImp;
    private Events: T;

    constructor(data?: string, id?: number, config?: Config)
    {
        //check if id is a valid enum
        if (this.Events[id] === 'undefined')
        {
            throw new RangeError("id is not a valid within enum");
        }
        
        this.messageImp = new MessageImp();
        
        if (! (typeof data === 'undefined' || data === null))
        {
            this.messageImp.setBody(data);
        }
        
        // Set the id if available
        if (typeof id === 'undefined' || id  === null){
            this.messageImp.getHeader().setId(id);
        }
        
        // Set the config to a default value if not available
        if (typeof config === 'undefined' || config === null)
        {
            this.messageImp.getHeader().setConfig(Config['None']);
        }else
        {
            this.messageImp.getHeader().setConfig(config);   
        }

        this.header.size = Object.keys(data).length;
        this.messageImp.getHeader().setSize(this.header.size);

    }

    size(): number {
        return this.header.size;
    }

    data(): string {
        return this.messageImp.getBody();
    }
    
    setID(id: number) {
        this.header.id = id;
        this.messageImp.getHeader().setId(id);
    }

    setConfig(config: Config) {
        this.header.config = config;
        this.messageImp.getHeader().setConfig(config);
    }

    getID(): number {
        return this.header.id;
    }

    getConfig(): Config {
        return this.header.config;
    } 

    serializeBinary(): any {
        return this.messageImp.serializeBinary();
    } 

    deserializeBinary(data: any) {
        this.messageImp = MessageImp.deserializeBinary(data);
        this.header.size = this.messageImp.getHeader().getSize();
        this.header.id = this.messageImp.getHeader().getId();
        this.header.config = this.messageImp.getHeader().getConfig();
    }
};

class OwnedMessage<T> {
    message: Message<T>;
    owner: Connection<T>;
};

export { Message, OwnedMessage };