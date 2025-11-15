import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';

/**
 * Módulo de CartItem
 * Nota: Los CartItems se manejan internamente desde CartService
 * No se exponen endpoints directos para esta entidad
 */
@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart, Product])],
  exports: [TypeOrmModule],
})
export class CartItemModule {}
