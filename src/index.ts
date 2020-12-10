
import * as conn from './Connection';

enum EventTypes {
    Hello, World, RandomNumber
};

var connection = new conn.Connection<EventTypes>();

connection.OnMessage = (message: conn.Message<EventTypes>) => {
    document.body.innerHTML = "Message Received: " + message.data();
}

connection.connectToServer("localhost", 60000);

document.body.innerHTML = "Connected!";