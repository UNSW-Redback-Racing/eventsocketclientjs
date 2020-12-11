// Testing the validity of our message type

import { Message, Config } from '../src/Message';

enum EventTypes {
    None, Hello, World
};

test('valid event types', () => {
    const msg = new Message<EventTypes>("Hello!", EventTypes.Hello, Config.None);
    expect(msg.ID()).toEqual(EventTypes.Hello);
});


test('message stored correctly', () => {
    const msg = new Message<EventTypes>("Hello!", EventTypes.Hello, Config.None);
    expect(msg.data()).toEqual("Hello!")
});

test('message size', () => {
    const data:string = "Hello!";
    const msg = new Message<EventTypes>(data, EventTypes.Hello, Config.None);
    expect(msg.size()).toEqual(data.length);
});

test('change id', () => {
    const msg = new Message<EventTypes>("Hello!", EventTypes.Hello, Config.None);
    msg.setID(EventTypes.World)
    expect(msg.ID()).toEqual(EventTypes.World)
});

test('serialize and deserialize', () => {
    const data: string = "Hello!";
    const msg = new Message<EventTypes>("Hello!", EventTypes.Hello, Config.None);

    const binary = msg.serializeBinary();

    const newmsg = new Message<EventTypes>("jibberish data", EventTypes.None, Config.None);
    newmsg.deserializeBinary(binary);
    
    expect(newmsg.data()).toEqual(msg.data());
    expect(newmsg.ID()).toEqual(msg.ID());
    expect(newmsg.Config()).toEqual(msg.Config());

});

