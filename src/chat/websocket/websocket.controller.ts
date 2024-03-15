import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { Message } from '../interfaces/message.interface';

@WebSocketGateway()
export class WebsocketController {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any): void {
    const message: Message = { ...data };
    this.chatService.sendMessage(message);
    this.server.emit('message', message);
  }
}
