import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

/**
 * Módulo de OrderItems
 * Nota: Los OrderItems se crean automáticamente al generar una orden desde OrdersService
 * No se exponen endpoints directos para esta entidad
 */
@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Product, User])],
  exports: [TypeOrmModule],
})
export class OrderItemsModule {}
