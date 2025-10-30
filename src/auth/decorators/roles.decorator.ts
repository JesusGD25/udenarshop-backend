import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';

/**
 * Clave para identificar roles requeridos en los metadatos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para requerir roles específicos en una ruta
 * 
 * Uso:
 * ```typescript
 * @Roles(Role.ADMIN)
 * @Delete(':id')
 * remove(@Param('id') id: string) {
 *   return this.productsService.remove(id);
 * }
 * ```
 * 
 * También puedes requerir múltiples roles (el usuario debe tener al menos uno):
 * ```typescript
 * @Roles(Role.ADMIN, Role.USER)
 * @Post()
 * create(@Body() dto: CreateDto) {
 *   return this.service.create(dto);
 * }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
