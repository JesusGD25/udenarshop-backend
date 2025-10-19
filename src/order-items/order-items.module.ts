import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Product, User])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [TypeOrmModule, OrderItemsService],
})
export class OrderItemsModule {}
