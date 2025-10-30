import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from './constants/jwt.constants';

/**
 * Módulo de autenticación
 * 
 * Configura:
 * - TypeORM con la entidad User
 * - Passport con estrategia JWT
 * - JwtModule con configuración de tokens
 * - Provee JwtStrategy para validar tokens
 */
@Module({
  imports: [
    // Importar entidad User para acceso a base de datos
    TypeOrmModule.forFeature([User]),
    
    // Configurar Passport con estrategia por defecto 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Configurar módulo JWT
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
