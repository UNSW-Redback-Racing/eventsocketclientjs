// All message related classes

import { Message as MessageImp } from './Message_pb';
import { Connection } from './Connection';

// Contains the size and id (eventid) of messages
interface MessageHeader<T> {};

// Contains the payload and header
interface Message<T> {};

// A message that is owned by a Connection
interface OwnedMessage<T> {};


enum Config {
    Forward, Forwarded, BroadcastAll, BroadcastRoom, Broadcasted,
    CreateRoom, CreateRoomResponse, JoinRoom, OnRoomJoined,
    None
};

class MessageHeader<T> {
    
    id: T;
    config: Config;
    size: number;
    constructor(id: T, config: Config, size: number){
        this.id = id;
        this.config = config;
        this.size = size;
    }
};


class Message<T> {
    private header: MessageHeader<T>;
    private messageImp: MessageImp;

    constructor(data?: string, id?: T, config?: Config)
    {
        this.messageImp = new MessageImp();

        // Set the data, config and id to a default value if not available
        let conf: Config = Config['None'];
        let payload: string = "";
        let eventid: number = 0;

        if (typeof config != 'undefined' && config != null)
        {
            conf = config
        }
        
        if (typeof data != 'undefined' && data != null)
        {
            payload = data;
        }
        
        if (typeof id != 'undefined' && id != null)
        {
            eventid = id as unknown as number;
        }

        this.header = new MessageHeader<T>(eventid as unknown as T, conf, payload.length);
        this.setData(payload);
        this.messageImp.getHeader().setId(eventid);
        this.messageImp.getHeader().setConfig(conf as unknown as number);
        this.messageImp.getHeader().setSize(payload.length);
    }

    size(): number {
        return this.header.size;
    }

    data(bytes: boolean = false): string | Uint8Array {
        if (bytes)
        {
            return this.messageImp.getBody();
        }
        
        return new TextDecoder().decode(this.messageImp.getBody() as Uint8Array);
    }

    setData(data: string | Uint8Array) {
        if (typeof data === 'string' || data instanceof String)
        {
            data = new TextEncoder().encode(data as string);
        }
        this.messageImp.setBody(data);
    }
    
    setID(id: T) {
        this.header.id = id;
        this.messageImp.getHeader().setId(id as unknown as number);
    }

    setConfig(config: Config) {
        this.header.config = config;
        this.messageImp.getHeader().setConfig(config);
    }

    ID(): T {
        return this.header.id;
    }

    Config(): Config {
        return this.header.config;
    } 

    serializeBinary(): Uint8Array {
        return this.messageImp.serializeBinary();
    } 

    deserializeBinary(data: Uint8Array) {

        this.messageImp = MessageImp.deserializeBinary(data);
        const size: number | undefined = this.messageImp.getHeader().getSize();
        const id: number | undefined = this.messageImp.getHeader().getId();
        const config: number | undefined = this.messageImp.getHeader().getConfig();

        if (size === undefined || id === undefined || config === undefined)
        {
            throw Error('Invalid size, id or config');
        }

        this.header.size = size;
        this.header.id =  id as unknown as T;
        this.header.config = config as unknown as Config; 
    }
};

class OwnedMessage<T> {

    message: Message<T>;
    owner: Connection<T>;
    constructor(message: Message<T>, owner: Connection<T>)
    {
        this.message = message;
        this.owner = owner;
    }
};

export { Message, OwnedMessage, Config};