import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCondition } from '../enums/product-condition.enum';

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

  /**
   * Precio del producto en Pesos Colombianos (COP)
   * - Tipo decimal sin decimales (pesos colombianos no usan centavos)
   * - Precisión: hasta 12 dígitos (ej: 999,999,999,999)
   * - Por defecto 0
   * 
   * Ejemplos de precios en COP:
   * - Producto económico: 50000 ($50.000 COP)
   * - Producto medio: 500000 ($500.000 COP)
   * - Producto costoso: 5000000 ($5.000.000 COP)
   */
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
