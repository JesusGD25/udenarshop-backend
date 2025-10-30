import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard de autenticación JWT
 * 
 * Este guard se ejecuta antes de cada petición y verifica:
 * 1. Si la ruta es pública (@Public()), permite el acceso
 * 2. Si no es pública, verifica que el token JWT sea válido
 * 3. Si el token es válido, adjunta el usuario a request.user
 * 4. Si el token es inválido o no existe, rechaza con 401
 * 
 * Se aplica globalmente en AppModule, por lo que afecta a todas las rutas
 * excepto las marcadas con @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determina si se puede activar la ruta
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Verificar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Decorador en el método
      context.getClass(),   // Decorador en la clase
    ]);

    // Si es pública, permitir acceso sin autenticación
    if (isPublic) {
      return true;
    }

    // Si no es pública, ejecutar la validación JWT de Passport
    return super.canActivate(context);
  }

  /**
   * Maneja el resultado de la validación
   * 
   * @param err - Error si ocurrió alguno
   * @param user - Usuario validado por JwtStrategy
   * @param info - Información adicional del error
   */
  handleRequest(err: any, user: any, info: any) {
    // Si hay error o no hay usuario, rechazar
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }

    // Retornar usuario que se adjuntará a request.user
    return user;
  }
}
