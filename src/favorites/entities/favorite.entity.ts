import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * Entidad Favorite - Representa un producto marcado como favorito por un usuario
 * 
 * Permite a los usuarios guardar productos de su interés para revisarlos más tarde.
 * Un usuario no puede marcar el mismo producto como favorito más de una vez.
 */
@Entity('favorites')
@Unique(['userId', 'productId']) // Un usuario solo puede marcar un producto como favorito una vez
export class Favorite {
  /**
   * Identificador único del favorito (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Fecha en que se marcó como favorito
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
   * ID del usuario que marcó el favorito
   */
  @Column('uuid')
  userId: string;

  /**
   * ID del producto marcado como favorito
   */
  @Column('uuid')
  productId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Usuario que marcó el favorito
   */
  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE', // Si se elimina el usuario, se eliminan sus favoritos
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Producto marcado como favorito
   */
  @ManyToOne(() => Product, (product) => product.favorites, {
    eager: true, // Cargamos la info del producto automáticamente
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
