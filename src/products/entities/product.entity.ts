import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCondition } from '../enums/product-condition.enum';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart-item/entities/cart-item.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chat/entities/chat.entity';

/**
 * Entidad Product - Representa un artículo publicado para la venta
 * 
 * Esta entidad almacena toda la información de un producto que un usuario
 * publica en el marketplace para vender.
 */
@Entity('products') // Nombre de la tabla en la base de datos
export class Product {
 
  @PrimaryGeneratedColumn('uuid')
  id: string;

 
  @Column('text', {
    unique: true,
  })
  title: string;

 
  @Column('text', {
    unique: true,
  })
  slug: string;

 
  @Column('text', {
    nullable: true,
  })
  description: string;

  @Column('decimal', {
    precision: 12,
    scale: 0,
    default: 0,
  })
  price: number;


  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.NEW,
  })
  condition: ProductCondition;

 
  @Column('text', {
    array: true,
    default: [],
  })
  images: string[];


  @Column('int', {
    default: 1,
  })
  stock: number;

 
  @Column('boolean', {
    default: false,
  })
  isSold: boolean;

  /**
   * Calificación promedio del producto
   * Calculada automáticamente desde las reviews
   * Rango: 0.0 - 5.0
   */
  @Column('decimal', {
    precision: 2,
    scale: 1,
    default: 0.0,
  })
  rating: number;

  /**
   * Cantidad total de reseñas del producto
   * Se incrementa automáticamente al recibir reviews
   */
  @Column('int', {
    default: 0,
  })
  totalReviews: number;

  /**
   * Contador de visualizaciones del producto
   * Se incrementa cada vez que alguien ve el detalle
   */
  @Column('int', {
    default: 0,
  })
  viewsCount: number;

  /**
   * Estado de la publicación
   * false = producto pausado/oculto
   * true = producto visible en el marketplace
   */
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  /**
   * Fecha de creación del registro
   * Se genera automáticamente al crear el producto
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización
   * Se actualiza automáticamente cada vez que se modifica el producto
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
   * ID del vendedor (usuario que publicó el producto)
   */
  @Column('uuid')
  sellerId: string;

  /**
   * ID de la categoría a la que pertenece el producto
   */
  @Column('uuid', {
    nullable: true,
  })
  categoryId: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Vendedor del producto (Usuario que lo publicó)
   */
  @ManyToOne(() => User, (user) => user.products, {
    eager: false,
  })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  /**
   * Categoría a la que pertenece el producto
   */
  @ManyToOne(() => Category, (category) => category.products, {
    eager: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // TODO: Descomentar cuando se implementen las entidades relacionadas

  /**
   * Productos marcados como favoritos
   */
  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  /**
   * Items de carrito que incluyen este producto
   */
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  /**
   * Items de orden que incluyen este producto
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  /**
   * Chats relacionados con este producto
   */
  @OneToMany(() => Chat, (chat) => chat.product)
  chats: Chat[];

  /**
   * Reseñas del producto
   */
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  // /**
  //  * Reportes del producto
  //  */
  // @OneToMany(() => Report, (report) => report.reportedProduct)
  // reports: Report[];

  // ==========================================
  // HOOKS
  // ==========================================

  /**
   * Hook que se ejecuta antes de insertar un nuevo producto
   * Genera el slug a partir del título
   */
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }

  /**
   * Hook que se ejecuta antes de actualizar un producto
   * Actualiza el slug si el título cambió
   */
  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }
}
