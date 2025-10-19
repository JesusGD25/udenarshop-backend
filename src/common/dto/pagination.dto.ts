import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

/**
 * DTO para paginación de consultas
 * Se usa en query parameters (?limit=10&offset=0)
 */
export class PaginationDto {
  /**
   * Número máximo de resultados a devolver
   * Por defecto: 10
   * Debe ser un número positivo
   */
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Transforma el string del query param a número
  limit?: number;

  /**
   * Número de resultados a saltar (para paginación)
   * Por defecto: 0
   * Debe ser mayor o igual a 0
   */
  @IsOptional()
  @Min(0)
  @Type(() => Number) // Transforma el string del query param a número
  offset?: number;
}
