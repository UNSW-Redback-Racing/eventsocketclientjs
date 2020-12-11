// A connection class that handles asynchronous operations and transmission of message objects

interface Connection<T> {}

import WebSocket = require('isomorphic-ws');

import { Message, Config} from './Message';


type IOnMessage<T> = (message: Message<T>) => void;
type IOnEvent<T> = (message: Message<T>) => void;
type IOnConnect<T> = (event: WebSocket.OpenEvent) => void;
type IOnClose<T> = (event: WebSocket.CloseEvent) => void;


// Util used to convert string to arraybuffer
function stringToAB(str: string){
    var buf = new ArrayBuffer(str.length); // 1 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

class Connection<T> {
    
    private ws: WebSocket | undefined;

    // Holds a message until it is ready to be processed
    private temporaryMessage: Message<T>;

    // All event callbacks
    private eventCallbacks: Map<T, IOnEvent<T>>;

    public OnMessage: IOnMessage<T> | undefined;
    public OnClose: IOnClose<T> | undefined;
    public OnConnect: IOnConnect<T> | undefined;
    
    constructor() {
        this.temporaryMessage = new Message<T>();
        this.eventCallbacks = new Map();
    }

    connectToServer(host: string, port: number): void {
        
        // Create a websocket 
        this.ws = new WebSocket("ws://" + host + ":" + port);
        this.ws.binaryType = "arraybuffer";
        this.ws.onopen = (ev: WebSocket.OpenEvent) => {
            this.configure();
            if (this.OnConnect)
            {
                this.OnConnect(ev);
            }
        }

    }

    // Setup the required websocket callbacks
    private configure(): void {
        if (this.ws === undefined || this.ws === null)
        {
            return;
        }

        this.ws.onmessage = (ev:WebSocket.MessageEvent) => {
            
            // Message object to contain data
            const message = new Message<T>(); 
            
            message.deserializeBinary(new Uint8Array(stringToAB(ev.data.toString())));
            
            // find if there are any event callbacks assigned for this event
            if (this.eventCallbacks.get(message.ID()) != undefined 
                && message.ID() != undefined)
            {
                this.eventCallbacks.get(message.ID())?.(message);

            }else if (!(typeof this.OnMessage === 'undefined' || this.OnMessage === null))
            {
                this.OnMessage(message);
            }

        }

        this.ws.onclose = (ev: WebSocket.CloseEvent) => {
            if (!(typeof this.OnClose === 'undefined' || this.OnMessage === null))
            {
                this.OnClose(ev);
            }
        }
    }

    public OnEvent(event: T, callback: IOnEvent<T>)
    {
        this.eventCallbacks.set(event, callback);
    }

    public send(message: Message<T>)
    {
        this.ws?.send(message.serializeBinary());
    }

    public broadcast(message: Message<T>)
    {
        message.setConfig(Config.BroadcastAll);
        this.send(message);
    }

    public broadcastRoom(message: Message<T>, roomid: number)
    {
        let payload: string | undefined = message.data();
        
        if (!payload)
        {
            payload = "";
        }

        message.setData(payload + roomid);
        
    }
    public close()
    {
        this.ws?.close();
    }

};

export { Connection };




