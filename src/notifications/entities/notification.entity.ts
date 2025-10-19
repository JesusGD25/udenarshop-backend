import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '../enums/notification-type.enum';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad Notification - Representa una notificación para un usuario
 * 
 * Almacena notificaciones de diversos eventos del sistema (nuevas órdenes,
 * mensajes, reseñas, cambios de precio, etc.) con metadata flexible en JSON.
 */
@Entity('notifications')
export class Notification {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tipo de notificación (NEW_ORDER, NEW_MESSAGE, etc.)
   */
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  /**
   * Título de la notificación
   */
  @Column('varchar', { length: 255 })
  title: string;

  /**
   * Mensaje descriptivo de la notificación
   */
  @Column('text')
  message: string;

  /**
   * Indica si la notificación ha sido leída
   */
  @Column('boolean', { default: false })
  isRead: boolean;

  /**
   * Metadata adicional en formato JSON
   * Puede contener IDs relacionados (orderId, productId, chatId, etc.)
   * y otros datos específicos según el tipo de notificación
   */
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  /**
   * Fecha de creación de la notificación
   */
  @CreateDateColumn()
  createdAt: Date;

  // ==========================================
  // FOREIGN KEYS
  // ==========================================

  /**
   * ID del usuario que recibe la notificación
   */
  @Column('uuid')
  userId: string;

  // ==========================================
  // RELATIONS
  // ==========================================

  /**
   * Usuario que recibe esta notificación
   */
  @ManyToOne(() => User, (user) => user.notifications, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
