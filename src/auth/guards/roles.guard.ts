import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';

/**
 * Guard para verificar roles de usuario
 * 
 * Este guard se ejecuta DESPUÉS de JwtAuthGuard y verifica:
 * 1. Si la ruta requiere roles específicos (@Roles(Role.ADMIN))
 * 2. Si no requiere roles, permite el acceso
 * 3. Si requiere roles, verifica que el usuario tenga al menos uno
 * 4. Si no tiene el rol, rechaza con 403 Forbidden
 * 
 * Ejemplo de uso:
 * ```typescript
 * @Roles(Role.ADMIN)
 * @Delete(':id')
 * remove(@Param('id') id: string) {
 *   return this.productsService.remove(id);
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos desde el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Decorador en el método
      context.getClass(),   // Decorador en la clase
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del request (ya validado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario (no debería pasar si JwtAuthGuard funcionó)
    if (!user) {
      throw new ForbiddenException('No se pudo verificar el usuario');
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
