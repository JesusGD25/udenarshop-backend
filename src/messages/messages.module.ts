import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Chat, User]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [TypeOrmModule, MessagesService],
})
export class MessagesModule {}
