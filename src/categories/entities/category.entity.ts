import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * Entidad Category - Representa una categoría de productos
 * 
 * Las categorías se usan para clasificar y organizar los productos
 * en el marketplace (Electrónica, Hogar, Ropa, Deportes, etc.)
 */
@Entity('categories')
export class Category {
  /**
   * Identificador único de la categoría (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre de la categoría
   * Debe ser único en el sistema
   * Ejemplos: "Electrónica", "Hogar y Jardín", "Deportes"
   */
  @Column('text', {
    unique: true,
  })
  name: string;

  /**
   * Slug de la categoría para URLs amigables
   * Generado automáticamente desde el nombre
   * Ejemplo: "electronica", "hogar-y-jardin"
   */
  @Column('text', {
    unique: true,
  })
  slug: string;

  /**
   * Descripción de la categoría (opcional)
   * Explica qué tipo de productos pertenecen a esta categoría
   */
  @Column('text', {
    nullable: true,
  })
  description: string;

  /**
   * URL del ícono de la categoría (opcional)
   * Para mostrar en la UI del frontend
   */
  @Column('text', {
    nullable: true,
  })
  iconUrl: string;

  /**
   * Estado de la categoría
   * false = categoría desactivada (no se muestra en el frontend)
   * true = categoría activa
   */
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  /**
   * Fecha de creación de la categoría
   * Se genera automáticamente
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // ==========================================
  // RELACIONES
  // ==========================================

  /**
   * Productos que pertenecen a esta categoría
   */
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // ==========================================
  // HOOKS
  // ==========================================

  /**
   * Hook ejecutado antes de insertar una nueva categoría
   * Genera el slug automáticamente desde el nombre
   */
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.name;
    }
    this.slug = this.slug
      .toLowerCase()
      .trim()
      .normalize('NFD') // Normalizar caracteres Unicode
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replaceAll(' ', '-')
      .replaceAll("'", '')
      .replace(/[^a-z0-9-]/g, ''); // Eliminar caracteres especiales
  }

  /**
   * Hook ejecutado antes de actualizar una categoría
   * Actualiza el slug si el nombre cambió
   */
  @BeforeUpdate()
  checkSlugUpdate() {
    if (this.slug) {
      this.slug = this.slug
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replaceAll(' ', '-')
        .replaceAll("'", '')
        .replace(/[^a-z0-9-]/g, '');
    }
  }
}
