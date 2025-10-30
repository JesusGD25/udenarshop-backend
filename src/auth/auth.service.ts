import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { Role } from '../users/enums/role.enum';

/**
 * Servicio de autenticación
 * 
 * Maneja el login, validación de usuarios y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales del usuario de forma privada
   * 
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Usuario validado
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  private async validateUser(email: string, password: string): Promise<User> {
    // Buscar usuario por email e incluir el password (normalmente no se incluye)
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: ['id', 'email', 'password', 'name', 'role', 'isActive', 'avatarUrl', 'phone'],
    });

    // Verificar si el usuario existe
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador.');
    }

    // Comparar contraseñas usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  /**
   * Realiza el login y genera el token JWT
   * 
   * @param loginDto - Credenciales de login
   * @returns Token JWT y datos del usuario
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Validar credenciales
    const user = await this.validateUser(email, password);

    // Crear payload del JWT con información del usuario
    const payload: JwtPayload = {
      sub: user.id,      // Subject (identificador del usuario)
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Generar token JWT firmado
    const accessToken = this.jwtService.sign(payload);

    // Eliminar password del objeto de respuesta
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login exitoso',
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: '24h',
      user: userWithoutPassword,
    };
  }

  /**
   * Verifica si un token JWT es válido
   * 
   * @param token - Token JWT a verificar
   * @returns Resultado de la verificación
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * @param registerDto - Datos del nuevo usuario
   * @returns Token JWT y datos del usuario registrado
   * @throws ConflictException si el email ya está registrado
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // Verificar si el email ya está registrado
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario con rol 'user' por defecto
      const newUser = this.userRepository.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: Role.USER, // Por defecto todos los registros son usuarios normales
        isActive: true,
      });

      // Guardar en la base de datos
      await this.userRepository.save(newUser);

      // Generar token JWT para auto-login después del registro
      const payload: JwtPayload = {
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      };

      const accessToken = this.jwtService.sign(payload);

      // Eliminar password del objeto de respuesta
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        message: 'Usuario registrado exitosamente',
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: '24h',
        user: userWithoutPassword,
      };
    } catch (error) {
      // Manejar errores de base de datos
      if (error.code === '23505') {
        throw new ConflictException('El email ya está registrado');
      }
      throw new BadRequestException('Error al registrar usuario');
    }
  }
}
