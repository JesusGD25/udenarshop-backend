import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Message } from '../messages/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User, Product, Message]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [TypeOrmModule, ChatService],
})
export class ChatModule {}
