import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Product } from '../../products/entities/product.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { Message } from '../../messages/entities/message.entity';
import { Notification } from '../../notifications/entities/notification.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  
  @Column('text')
  name: string;

 
  @Column('text', {
    unique: true,
  })
  email: string;


  @Column('text', {
    select: false, // No se devuelve en queries por defecto (seguridad)
  })
  password: string;


  @Column('text', {
    nullable: true,
  })
  phone: string;


  @Column('text', {
    nullable: true,
  })
  avatarUrl: string;


  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;


  @Column('text', {
    nullable: true,
  })
  address: string;

 
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;


  @Column('decimal', {
    precision: 2,
    scale: 1,
    default: 0.0,
  })
  rating: number;

  @Column('int', {
    default: 0,
  })
  totalReviews: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Productos publicados por este usuario (como vendedor)
   */
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  /**
   * Carrito de compras del usuario
   */
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  /**
   * Productos marcados como favoritos
   */
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  /**
   * Órdenes de compra realizadas (como comprador)
   */
  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  /**
   * Productos vendidos (items de órdenes donde es el vendedor)
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.seller)
  soldItems: OrderItem[];

  /**
   * Chats donde el usuario es comprador
   */
  @OneToMany(() => Chat, (chat) => chat.buyer)
  chatsAsBuyer: Chat[];

  /**
   * Chats donde el usuario es vendedor
   */
  @OneToMany(() => Chat, (chat) => chat.seller)
  chatsAsSeller: Chat[];

  /**
   * Mensajes enviados por el usuario
   */
  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  /**
   * Reseñas escritas por el usuario (como comprador)
   */
  @OneToMany(() => Review, (review) => review.user)
  reviewsGiven: Review[];

  /**
   * Reseñas recibidas por el usuario (como vendedor)
   */
  @OneToMany(() => Review, (review) => review.seller)
  reviewsReceived: Review[];

  /**
   * Notificaciones del usuario
   */
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // /**
  //  * Reportes creados por el usuario
  //  */
  // @OneToMany(() => Report, (report) => report.reporter)
  // reportsCreated: Report[];

  // /**
  //  * Reportes recibidos sobre este usuario
  //  */
  // @OneToMany(() => Report, (report) => report.reportedUser)
  // reportsReceived: Report[];

  // ==========================================
  // HOOKS
  // ==========================================

  /**
   * Hook ejecutado antes de insertar un nuevo usuario
   * Normaliza el email a minúsculas
   */
  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  /**
   * Hook ejecutado antes de actualizar un usuario
   * Normaliza el email a minúsculas
   */
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
