import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from '../../cart-item/entities/cart-item.entity';

/**
 * Entidad Cart - Representa el carrito de compras de un usuario
 * 
 * Cada usuario tiene un único carrito activo donde puede agregar
 * productos antes de proceder con el checkout.
 */
@Entity('carts')
export class Cart {
  /**
   * Identificador único del carrito (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Fecha de creación del carrito
   * Se genera automáticamente al crear el usuario
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización del carrito
   * Se actualiza cada vez que se agregan/eliminan items
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
   * ID del usuario dueño del carrito
   * Relación 1:1 (un usuario tiene un carrito)
   */
  @Column('uuid', {
    unique: true,
  })
  userId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Usuario dueño del carrito
   */
  @OneToOne(() => User, (user) => user.cart, {
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Items dentro del carrito
   */
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true, // Al eliminar el carrito, se eliminan los items
  })
  items: CartItem[];
}
