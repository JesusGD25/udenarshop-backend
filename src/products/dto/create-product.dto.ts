import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductCondition } from '../enums/product-condition.enum';

/**
 * DTO para crear un nuevo producto
 * Define los datos requeridos y sus validaciones
 */
export class CreateProductDto {
  /**
   * Título del producto
   * - Mínimo 3 caracteres
   * - Obligatorio
   * - Debe ser único (validado en base de datos)
   */
  @IsString()
  @MinLength(3)
  title: string;

  /**
   * Slug del producto (URL-friendly)
   * - Opcional: si no se envía, se genera automáticamente desde el título
   * - Si se envía, debe ser string
   */
  @IsString()
  @IsOptional()
  slug?: string;

  /**
   * Descripción detallada del producto
   * - Opcional
   * - Tipo string
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Precio del producto en Pesos Colombianos (COP)
   * - Debe ser un número entero
   * - Debe ser positivo (mayor a 0)
   * - Obligatorio
   * - No se permiten decimales (COP no usa centavos)
   * 
   * Ejemplos válidos:
   * - 50000 ($50.000 COP)
   * - 1500000 ($1.500.000 COP)
   * - 25000000 ($25.000.000 COP)
   */
  @IsNumber()
  @IsPositive()
  @IsInt()
  price: number;

  /**
   * Condición del producto
   * - Opcional: por defecto será 'new'
   * - Solo acepta valores del enum ProductCondition
   */
  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  /**
   * Array de URLs de imágenes
   * - Opcional: por defecto será array vacío
   * - Debe ser un array
   * - Cada elemento debe ser string
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  /**
   * Cantidad disponible en stock
   * - Opcional: por defecto será 1
   * - Debe ser número entero
   * - Debe ser mínimo 0
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  /**
   * Indica si el producto está vendido
   * - Opcional: por defecto será false
   * - Tipo booleano
   */
  @IsBoolean()
  @IsOptional()
  isSold?: boolean;
}
