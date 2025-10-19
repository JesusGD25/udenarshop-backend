import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

/**
 * Entidad Order - Representa una orden de compra
 * 
 * Una orden es creada cuando un usuario procede al checkout
 * y contiene todos los productos que está comprando.
 */
@Entity('orders')
export class Order {
  /**
   * Identificador único de la orden (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Número de orden único generado
   * Formato: "ORD-YYYYMMDD-XXXXX"
   * Ejemplo: "ORD-20251018-00001"
   */
  @Column('text', {
    unique: true,
  })
  orderNumber: string;

  /**
   * Monto total de la orden en Pesos Colombianos (COP)
   * Suma de todos los items (precio * cantidad)
   */
  @Column('decimal', {
    precision: 12,
    scale: 0,
  })
  totalAmount: number;

  /**
   * Estado actual de la orden
   */
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  /**
   * Método de pago seleccionado
   */
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  /**
   * Dirección de envío de la orden
   */
  @Column('text')
  shippingAddress: string;

  /**
   * Notas adicionales del comprador (opcional)
   */
  @Column('text', {
    nullable: true,
  })
  notes: string;

  /**
   * Fecha de creación de la orden
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización de la orden
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // ==========================================
  // FOREIGN KEYS
  // ==========================================

  /**
   * ID del comprador (usuario que realizó la orden)
   */
  @Column('uuid')
  buyerId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Comprador de la orden
   */
  @ManyToOne(() => User, (user) => user.orders, {
    eager: false,
  })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  /**
   * Items incluidos en la orden
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true, // Al crear la orden, se crean los items
  })
  items: OrderItem[];

  // ==========================================
  // HOOKS
  // ==========================================

  /**
   * Hook ejecutado antes de insertar una nueva orden
   * Genera el orderNumber único
   */
  @BeforeInsert()
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
}
