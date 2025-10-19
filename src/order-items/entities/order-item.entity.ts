import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';

/**
 * Entidad OrderItem - Representa un producto dentro de una orden
 * 
 * Almacena un snapshot del producto en el momento de la compra,
 * preservando precio, título y vendedor para mantener historial preciso.
 */
@Entity('order_items')
export class OrderItem {
  /**
   * Identificador único del item (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Cantidad del producto comprado
   */
  @Column('int')
  quantity: number;

  /**
   * Precio unitario del producto en el momento de la compra (COP)
   * Se congela para mantener historial preciso
   */
  @Column('decimal', {
    precision: 12,
    scale: 0,
  })
  price: number;

  /**
   * Título del producto en el momento de la compra
   * Snapshot para mantener historial si el producto cambia después
   */
  @Column('text')
  productTitle: string;

  /**
   * Fecha de creación del item
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
   * ID de la orden a la que pertenece este item
   */
  @Column('uuid')
  orderId: string;

  /**
   * ID del producto comprado
   */
  @Column('uuid')
  productId: string;

  /**
   * ID del vendedor en el momento de la compra
   * Útil para reportes de ventas por vendedor
   */
  @Column('uuid')
  sellerId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Orden a la que pertenece este item
   */
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE', // Si se elimina la orden, se eliminan los items
    eager: false,
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  /**
   * Producto comprado
   */
  @ManyToOne(() => Product, (product) => product.orderItems, {
    eager: true, // Cargamos la info del producto automáticamente
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Vendedor del producto
   */
  @ManyToOne(() => User, (user) => user.soldItems, {
    eager: false,
  })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  /**
   * Reseña asociada a esta compra (opcional, uno a uno)
   */
  @OneToOne(() => Review, (review) => review.orderItem)
  review: Review;
}
