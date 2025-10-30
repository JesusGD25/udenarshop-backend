import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controlador de autenticación
 * 
 * Maneja endpoints relacionados con autenticación:
 * - Login (público)
 * - Obtener perfil del usuario autenticado (protegido)
 * - Verificar token (protegido)
 */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de login
   * 
   * Ruta pública que genera un token JWT si las credenciales son válidas
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión y obtener token JWT',
    description: 
      'Autentica un usuario con email y password. Retorna un token JWT válido por 24 horas.\n\n' +
      '**Credenciales de prueba:**\n' +
      '- Admin: `admin@shopudenar.com` / `Admin123!`\n' +
      '- Usuario: `juan.perez@udenar.edu.co` / `User123!`',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso - Retorna token JWT y datos del usuario',
    schema: {
      example: {
        message: 'Login exitoso',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '24h',
        user: {
          id: 'uuid-123',
          email: 'usuario@example.com',
          name: 'Usuario Ejemplo',
          role: 'user',
          isActive: true,
          phone: '3001234567',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o usuario inactivo',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['email debe ser un email válido', 'password debe tener al menos 6 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint de registro de nuevos usuarios
   * 
   * Ruta pública que crea un nuevo usuario y genera un token JWT automáticamente
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 
      'Crea una nueva cuenta de usuario en el sistema. El usuario se registra con rol "user" por defecto.\n\n' +
      'Después del registro exitoso, retorna un token JWT para login automático.\n\n' +
      '**Validaciones:**\n' +
      '- Nombre: mínimo 3 caracteres\n' +
      '- Email: debe ser válido y único\n' +
      '- Contraseña: mínimo 6 caracteres, debe incluir mayúscula, minúscula y número',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente - Retorna token JWT',
    schema: {
      example: {
        message: 'Usuario registrado exitosamente',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '24h',
        user: {
          id: 'uuid-123',
          email: 'nuevo@example.com',
          name: 'Usuario Nuevo',
          role: 'user',
          isActive: true,
          phone: '3001234567',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email ya está registrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'El email ya está registrado',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'El nombre debe tener al menos 3 caracteres',
          'Debe proporcionar un email válido',
          'La contraseña debe incluir al menos una mayúscula, una minúscula y un número',
        ],
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Obtener perfil del usuario autenticado
   * 
   * Ruta protegida que requiere token JWT válido
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 
      'Retorna información del usuario actual basada en el token JWT.\n\n' +
      '**Requiere:** Token JWT válido en el header Authorization',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        message: 'Perfil del usuario autenticado',
        user: {
          id: 'uuid-123',
          email: 'usuario@example.com',
          name: 'Usuario Ejemplo',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado - Token inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido o expirado',
      },
    },
  })
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Perfil del usuario autenticado',
      user,
    };
  }

  /**
   * Verificar si el token es válido
   * 
   * Útil para el frontend para verificar el estado de autenticación
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar si el token JWT es válido',
    description: 
      'Valida el token actual y retorna información del usuario.\n\n' +
      'Útil para que el frontend verifique si la sesión sigue activa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        user: {
          id: 'uuid-123',
          email: 'usuario@example.com',
          name: 'Usuario Ejemplo',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token inválido o expirado',
      },
    },
  })
  async verifyToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user,
    };
  }
}
