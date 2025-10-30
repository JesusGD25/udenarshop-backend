import { SetMetadata } from '@nestjs/common';

/**
 * Clave para identificar rutas públicas en los metadatos
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 * 
 * Uso:
 * ```typescript
 * @Public()
 * @Get('products')
 * findAll() {
 *   return this.productsService.findAll();
 * }
 * ```
 * 
 * Por defecto, todas las rutas requieren autenticación (JwtAuthGuard global).
 * Usa este decorador para las excepciones como login, registro, ver productos, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
