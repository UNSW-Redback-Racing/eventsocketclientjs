// Test the validity of the Connection class
import { Connection } from '../src/Connection';
import WebSocket = require("../node_modules/@types/ws");
import { Message, Config} from '../src/Message';

interface Server {
    host: string,
    port: number
}

enum EventTypes {
    Hello, World
}

const server: Server = {host: "127.0.0.1", port:60000};

test('On connection successful', () => {
    return new Promise((resolve, reject) => {
        const conn = new Connection<EventTypes>();
        conn.OnConnect = (msg: WebSocket.OpenEvent) => {
            conn.close();
        };

        conn.OnEvent(EventTypes.Hello, (msg: Message<EventTypes>) => {
            resolve('Got Message ' + msg.data());
        });

        conn.connectToServer(server.host, server.port);
    });
}); 

test('Sending messages', () => {
    return new Promise((resolve, reject) => {
        const conn = new Connection<EventTypes>();
        conn.OnConnect = (msg: WebSocket.OpenEvent) => {
            const message = new Message<EventTypes>("Hello Server!", EventTypes.Hello, Config.None);
            conn.send(message);
        };

        conn.OnEvent(EventTypes.Hello, (message:Message<EventTypes>) => {
            resolve('Receiving messages successful');
        });
        conn.connectToServer(server.host, server.port);
    });
});