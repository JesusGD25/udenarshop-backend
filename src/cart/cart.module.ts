import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-item/entities/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem])],
  controllers: [CartController],
  providers: [CartService],
  exports: [TypeOrmModule, CartService],
})
export class CartModule {}
