// Type declarations for exporting
import WebSocket = require('isomorphic-ws');

export enum Config {
    Forward, Forwarded, BroadcastAll, BroadcastRoom, Broadcasted,
    CreateRoom, CreateRoomResponse, JoinRoom, OnRoomJoined,
    None    
}

export class Message<T> {
    constructor(data?: string, id?: T, config?: Config);

    size(): number;
    data(bytes: boolean): string | Uint8Array;
    setData(data: string | Uint8Array);
    setID(id: T);
    setConfig(config: Config);
    ID(): T;
    Config(): Config;
    serializeBinary(): Uint8Array;
    deserializeBinary(data: Uint8Array);
}

export type IOnMessage<T> = (message: Message<T>) => void;
export type IOnEvent<T> = (message: Message<T>) => void;
export type IOnForwarded<T> = (message: Message<T>, id: number) => void;
export type IOnRoomCreated<T> = (roomid: number) => void;
export type IOnConnect<T> = (event: WebSocket.OpenEvent) => void;
export type IOnClose<T> = (event: WebSocket.CloseEvent) => void;

export class Connection<T> {
    constructor();
    connectToServer(host: string, port: number): void;
    private configure(): void;
    public OnEvent(event: T, callback: IOnEvent<T>);
    public send(message: Message<T>);
    public broadcast(message: Message<T>);
    public forward(message: Message<T>, to: number);
    public broadcastRoom(message: Message<T>, roomid: number);
    public createRoom();
    public joinRoom(roomid: number);
    public isConnected(): boolean;
	public close();

    public OnMessage: IOnMessage<T> | undefined;
    public OnClose: IOnClose<T> | undefined;
    public OnConnect: IOnConnect<T> | undefined;
    public OnBroadCast: IOnForwarded<T> | undefined;
    public OnRoomCreated: IOnRoomCreated<T> | undefined;
    public OnRoomJoined: IOnEvent<T> | undefined;
    public OnForwarded: IOnForwarded<T> | undefined;
}
