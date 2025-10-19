import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart, Product])],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [TypeOrmModule, CartItemService],
})
export class CartItemModule {}
