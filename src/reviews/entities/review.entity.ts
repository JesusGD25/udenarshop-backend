import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { ReviewType } from '../enums/review-type.enum';

/**
 * Entidad Review - Representa una reseña/calificación
 * 
 * Los usuarios pueden calificar productos o vendedores después de realizar una compra.
 * Solo se puede dejar una reseña por producto comprado (vinculado a orderItem).
 */
@Entity('reviews')
export class Review {
  /**
   * Identificador único de la reseña (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Calificación numérica (1-5 estrellas)
   * Validación: debe estar entre 1 y 5
   */
  @Column('int')
  rating: number;

  /**
   * Comentario escrito de la reseña (opcional)
   * Máximo 1000 caracteres
   */
  @Column('text', {
    nullable: true,
  })
  comment: string;

  /**
   * Tipo de reseña (producto o vendedor)
   */
  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  /**
   * Fecha de creación de la reseña
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización de la reseña
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
   * ID del usuario que escribió la reseña (comprador)
   */
  @Column('uuid')
  userId: string;

  /**
   * ID del producto reseñado (solo si type = PRODUCT)
   */
  @Column('uuid', {
    nullable: true,
  })
  productId: string;

  /**
   * ID del vendedor reseñado (solo si type = SELLER)
   */
  @Column('uuid', {
    nullable: true,
  })
  sellerId: string;

  /**
   * ID del item de orden asociado (único)
   * Garantiza que solo se pueda reseñar una vez por compra
   */
  @Column('uuid', {
    unique: true,
    nullable: true,
  })
  orderItemId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Usuario que escribió la reseña (autor)
   */
  @ManyToOne(() => User, (user) => user.reviewsGiven, {
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Producto reseñado (si type = PRODUCT)
   */
  @ManyToOne(() => Product, (product) => product.reviews, {
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  /**
   * Vendedor reseñado (si type = SELLER)
   */
  @ManyToOne(() => User, (user) => user.reviewsReceived, {
    eager: false,
  })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  /**
   * Item de orden asociado a esta reseña
   * Relación 1:1 - Solo una reseña por item comprado
   */
  @OneToOne(() => OrderItem, (orderItem) => orderItem.review, {
    eager: false,
  })
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItem;

  // ==========================================
  // HOOKS
  // ==========================================

  /**
   * Hook ejecutado después de insertar una nueva reseña
   * Actualiza el rating promedio del producto o vendedor
   */
  @AfterInsert()
  async updateRatingAfterInsert() {
    // TODO: Implementar lógica para actualizar rating promedio
    // Si type = PRODUCT: actualizar product.rating y product.totalReviews
    // Si type = SELLER: actualizar seller.rating y seller.totalReviews
  }

  /**
   * Hook ejecutado después de actualizar una reseña
   * Recalcula el rating promedio del producto o vendedor
   */
  @AfterUpdate()
  async updateRatingAfterUpdate() {
    // TODO: Implementar lógica para recalcular rating promedio
  }

  /**
   * Hook ejecutado después de eliminar una reseña
   * Recalcula el rating promedio del producto o vendedor
   */
  @AfterRemove()
  async updateRatingAfterRemove() {
    // TODO: Implementar lógica para recalcular rating promedio
  }
}
