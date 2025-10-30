import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { jwtConstants } from '../constants/jwt.constants';
import { User } from '../../users/entities/user.entity';

/**
 * Interfaz para el payload del JWT
 */
export interface JwtPayload {
  sub: string; // User ID (subject)
  email: string;
  name: string;
  role: string;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration time (timestamp)
}

/**
 * Estrategia JWT para autenticación
 * 
 * Esta clase se ejecuta automáticamente cuando se usa el JwtAuthGuard.
 * Extrae el token del header Authorization, verifica su firma y valida el usuario.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      // Extraer token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // No ignorar tokens expirados (los rechaza automáticamente)
      ignoreExpiration: false,
      
      // Clave secreta para verificar la firma del token
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Método que se ejecuta después de verificar la firma del JWT
   * 
   * @param payload - Datos decodificados del token
   * @returns Usuario validado que se adjunta a request.user
   */
  async validate(payload: JwtPayload) {
    const { sub } = payload;

    // Buscar usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { id: sub, isActive: true },
    });

    // Si no existe o está inactivo, rechazar
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    // Este objeto se adjunta automáticamente a request.user
    // y estará disponible en todos los controladores
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
