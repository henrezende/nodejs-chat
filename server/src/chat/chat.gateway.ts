import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private chatService: ChatService) {}

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

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
    await this.chatService.createMessage(payload);
    this.server.emit('recMessage', payload);
  }

  @SubscribeMessage('getMessageHistory')
  async handleGetMessageHistory(): Promise<void> {
    const chatObjects = await this.chatService.getMessages();

    const parsedMessages = chatObjects.map((chat) => ({
      id: chat.id,
      username: chat.username,
      text: chat.text,
      timestamp: chat.timestamp,
    }));

    this.server.emit('recMessageHistory', parsedMessages);
  }
}
