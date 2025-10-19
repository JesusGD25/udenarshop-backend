import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * Entidad CartItem - Representa un producto dentro de un carrito
 * 
 * Cada item asocia un producto específico a un carrito con su cantidad.
 * Un mismo producto no puede estar duplicado en el mismo carrito.
 */
@Entity('cart_items')
@Unique(['cartId', 'productId']) // Un producto solo puede estar una vez en el mismo carrito
export class CartItem {
  /**
   * Identificador único del item (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Cantidad del producto en el carrito
   * Mínimo 1
   */
  @Column('int', {
    default: 1,
  })
  quantity: number;

  /**
   * Fecha en que se agregó el item al carrito
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // ==========================================
  // FOREIGN KEYS
  // ==========================================

  /**
   * ID del carrito al que pertenece este item
   */
  @Column('uuid')
  cartId: string;

  /**
   * ID del producto agregado al carrito
   */
  @Column('uuid')
  productId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Carrito al que pertenece este item
   */
  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE', // Si se elimina el carrito, se eliminan los items
    eager: false,
  })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  /**
   * Producto agregado al carrito
   */
  @ManyToOne(() => Product, (product) => product.cartItems, {
    eager: true, // Cargamos la info del producto automáticamente
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
