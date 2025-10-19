import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad Message - Representa un mensaje individual dentro de un chat
 * 
 * Almacena el contenido del mensaje, el usuario que lo envió,
 * y si ha sido leído por el destinatario.
 */
@Entity('messages')
export class Message {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Contenido del mensaje
   */
  @Column('text')
  content: string;

  /**
   * Indica si el mensaje ha sido leído por el destinatario
   */
  @Column('boolean', { default: false })
  isRead: boolean;

  /**
   * Fecha de creación del mensaje
   */
  @CreateDateColumn()
  createdAt: Date;

  // ==========================================
  // FOREIGN KEYS
  // ==========================================

  /**
   * ID del chat al que pertenece este mensaje
   */
  @Column('uuid')
  chatId: string;

  /**
   * ID del usuario que envió el mensaje
   */
  @Column('uuid')
  senderId: string;

  // ==========================================
  // RELATIONS
  // ==========================================

  /**
   * Chat al que pertenece este mensaje
   */
  @ManyToOne(() => Chat, (chat) => chat.messages, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  /**
   * Usuario que envió el mensaje
   */
  @ManyToOne(() => User, (user) => user.messages, {
    eager: false,
  })
  @JoinColumn({ name: 'senderId' })
  sender: User;
}
