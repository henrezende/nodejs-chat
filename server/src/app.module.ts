import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat/chat.gateway';
import { Chat } from './chat/chat.entity';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'admin',
      password: 'admin',
      database: 'chatdb',
      entities: [Chat],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Chat]),
  ],
  providers: [ChatService, ChatGateway],
})
export class AppModule {}
