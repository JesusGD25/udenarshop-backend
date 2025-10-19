import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
