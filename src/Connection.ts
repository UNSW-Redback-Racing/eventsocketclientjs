// A connection class that handles asynchronous operations and transmission of message objects

interface Connection<T> {}

import { Message, OwnedMessage } from './Message';


type IOnMessage<T> = (message: Message<T>) => void;
type IOnEvent<T> = (message: Message<T>) => void;
type IOnClose<T> = (event: CloseEvent) => void;

class Connection<T> {
    
    private ws: WebSocket;

    private temporaryMessage: Message<T>;

    public OnMessage: IOnMessage<T>;
    public OnClose: IOnClose<T>;

    constructor() {}

    connectToServer(host: string, port: number): void {
        
        // Create a websocket 
        this.ws = new WebSocket("ws://" + host + ":" + port);
        
        this.ws.onopen = (ev: Event) => {
            this.configure();
        }

    }

    // Setup the required websocket callbacks
    configure(): void {
        this.ws.onmessage = (ev:MessageEvent<any>) => {
            
            // Message object to contain data
            const message = new Message<T>(); 
            
            // get the data from the payload
            message.deserializeBinary(ev.data);
            
            // call the on message function if it exists
            if (!(typeof this.OnMessage === 'undefined' || this.OnMessage === null))
            {
                this.OnMessage(message);
            }

        }

        this.ws.onclose = (ev: CloseEvent) => {
            if (!(typeof this.OnClose === 'undefined' || this.OnMessage === null))
            {
                this.OnClose(ev);
            }
        }
    }

};


export { Connection };
export * from './Message';




