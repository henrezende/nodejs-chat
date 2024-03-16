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
  private activeUsernames: Map<string, number> = new Map();

  handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    const validatedUsername = this.validateUsername(username);
    this.connectedUsers.set(client.id, validatedUsername);
    this.notifyUserListUpdate();
    this.server.emit('validatedUsername', {
      name: validatedUsername,
      id: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    const username = client.handshake.query.username as string;

    this.connectedUsers.delete(client.id);
    this.notifyUserListUpdate();
    this.updateActiveUsernames(username);
  }

  notifyUserListUpdate() {
    const userList = Array.from(this.connectedUsers.values());
    this.server.emit('userListUpdate', userList);
  }

  validateUsername(username: string): string {
    let count = this.activeUsernames.get(username) || 0;
    if (count > 0) {
      count++;
      this.activeUsernames.set(username, count);
      return `${username} (${count})`;
    } else {
      this.activeUsernames.set(username, 1);
      return username;
    }
  }

  updateActiveUsernames(username: string): void {
    let countOfCurrentUsername = this.activeUsernames.get(username);
    if (countOfCurrentUsername > 1) {
      countOfCurrentUsername--;
      this.activeUsernames.set(username, countOfCurrentUsername);
    } else {
      this.activeUsernames.delete(username);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('message', payload);
  }
}
