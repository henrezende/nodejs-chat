import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    this.connectedUsers.set(client.id, username);
    this.notifyUserListUpdate();
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.notifyUserListUpdate();
  }

  notifyUserListUpdate() {
    const userList = Array.from(this.connectedUsers.values());
    this.server.emit('userListUpdate', userList);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('message', payload);
  }
}
