import {
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
import { Product } from '../../products/entities/product.entity';
import { Message } from '../../messages/entities/message.entity';

/**
 * Entidad Chat - Representa una conversación entre dos usuarios sobre un producto
 * 
 * Almacena la información de la conversación, incluyendo los participantes (comprador y vendedor),
 * el producto sobre el cual se está consultando, y el último mensaje enviado.
 */
@Entity('chats')
export class Chat {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Fecha de creación del chat
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Fecha de última actualización del chat
   */
  @UpdateDateColumn()
  updatedAt: Date;

  // ==========================================
  // FOREIGN KEYS
  // ==========================================

  /**
   * ID del usuario comprador (quien inicia la conversación)
   */
  @Column('uuid')
  buyerId: string;

  /**
   * ID del usuario vendedor (dueño del producto)
   */
  @Column('uuid')
  sellerId: string;

  /**
   * ID del producto sobre el cual se consulta
   */
  @Column('uuid')
  productId: string;

  /**
   * Último mensaje enviado en este chat (opcional, para mostrar preview)
   */
  @Column('text', { nullable: true })
  lastMessage: string;

  /**
   * Fecha del último mensaje enviado
   */
  @Column('timestamp', { nullable: true })
  lastMessageAt: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  /**
   * Usuario comprador (quien inicia la conversación)
   */
  @ManyToOne(() => User, (user) => user.chatsAsBuyer, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  /**
   * Usuario vendedor (dueño del producto)
   */
  @ManyToOne(() => User, (user) => user.chatsAsSeller, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  /**
   * Producto sobre el cual se consulta
   */
  @ManyToOne(() => Product, (product) => product.chats, {
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Mensajes dentro de este chat
   */
  @OneToMany(() => Message, (message) => message.chat, {
    cascade: true,
  })
  messages: Message[];
}
