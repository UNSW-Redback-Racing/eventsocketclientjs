// Test the validity of the Connection class
import { Connection } from '../src/Connection';
import WebSocket = require("../node_modules/@types/ws");
import { Message, Config} from '../src/Message';
import { exception } from 'console';

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

test('Broadcasting messages', () => {

    return new Promise((resolve, reject) => {
        const connBroadcaster = new Connection<EventTypes>();
        connBroadcaster.OnConnect = (msg: WebSocket.OpenEvent) => {
            // Broadcast a message to all users
            connBroadcaster.broadcast(new Message<EventTypes>("Hello!", EventTypes.Hello, Config.BroadcastAll));  
        };

        const connReceiver = new Connection<EventTypes>();
        connReceiver.OnBroadCast = (message: Message<EventTypes>, id:number) => {
            resolve(message.data());
        };

        // We launch the receiver first
        connReceiver.connectToServer(server.host, server.port);
        connBroadcaster.connectToServer(server.host, server.port);
    }).then((message) => {
        expect(message).toEqual("Hello!");
    });
});

test('Forwarding messages', () => {

    const data: string = "Hello";
    return new Promise((resolve, reject) => {
        const connBroadcaster = new Connection<EventTypes>();
        connBroadcaster.OnConnect = (msg: WebSocket.OpenEvent) => {
            // Broadcast a message to all users
            connBroadcaster.broadcast(new Message<EventTypes>(data, EventTypes.Hello, Config.BroadcastAll));  
        };

        connBroadcaster.OnForwarded = (msg: Message<EventTypes>, id: number) => {
            connBroadcaster.close();
            console.log(id, ' forwarded ', msg.data())
            resolve(msg.data());
        };

        const connReceiver = new Connection<EventTypes>();
        connReceiver.OnBroadCast = (message: Message<EventTypes>, id:number) => {
            // forward the message back
            console.log(id, ' broadcasted ', message.data())

            connReceiver.forward(message, id);
            connReceiver.close();
        };

        // We launch the receiver first
        connReceiver.connectToServer(server.host, server.port);
        connBroadcaster.connectToServer(server.host, server.port);
    }).then((message) => {
        expect(message).toEqual(data);
    });
})

test('Creating rooms', () => {
    return new Promise((resolve, reject) => {
        // Create connection
        const conn = new Connection<EventTypes>();
        conn.OnConnect = (ev: WebSocket.OpenEvent) => {
            // Create a room and weight for the response
            conn.createRoom();
        };

        conn.OnRoomCreated = (roomid: number) => {
            // Success!
            conn.close();
            resolve(roomid);
        };

        conn.connectToServer(server.host, server.port);
    });
});

test('Join room and broadcast room', () => {
    const data = 'Hello!';
    return new Promise((resolve, reject) => {
        // Create connection

        var room;
        const connCreator = new Connection<EventTypes>();
        connCreator.OnConnect = (ev: WebSocket.OpenEvent) => {
            // Create a room and wait for the response
            connCreator.createRoom();
        };

        connCreator.OnRoomCreated = (roomid) => {
            room = roomid;
        };
        connCreator.OnBroadCast = (message: Message<EventTypes>) => {
            // Receive a broadcast within a room
            resolve(message.data());
        };
        const connJoiner = new Connection<EventTypes>();
        connJoiner.OnRoomCreated = (roomid: number) => {
            // Broadcast data to message
            connJoiner.broadcast(new Message<EventTypes>(data, EventTypes.Hello));
        };
        connJoiner.connectToServer(server.host, server.port);
        connCreator.connectToServer(server.host, server.port);
    }).then((val) => {
        expect(val).toEqual(data);
    });
});


test('Auto reconnect', () => {

    let ntries = 0;
    return new Promise((resolve, reject) => {
        const conn = new Connection<EventTypes>();

        conn.OnConnect = (ev: WebSocket.OpenEvent) => {
            // Disconnect 
            ntries += 1;
            if (ntries == 2)
            {
                //reconnection succeeded
                resolve(ntries);
            }
            conn.close();
        };

        conn.OnClose = (event: WebSocket.CloseEvent) => {
            // Try to reconnect again
            if (ntries != 2){
                conn.connectToServer(server.host, server.port);
            }
        }

        conn.connectToServer(server.host, server.port);
    }).then((val) => {
        expect(val).toEqual(2);
    });
});