import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from './enums/role.enum';

/**
 * Controlador de usuarios
 * 
 * Protección de rutas:
 * - POST /users (registro): Pública
 * - GET /users (listar todos): Solo ADMIN
 * - GET /users/:id (ver uno): Usuario dueño o ADMIN
 * - PATCH /users/:id (actualizar): Usuario dueño o ADMIN
 * - DELETE /users/:id (eliminar): Solo ADMIN
 */
@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registro de nuevo usuario
   * Ruta pública para permitir registro
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      '**Ruta pública**\n\n' +
      'Permite que cualquier persona se registre en el marketplace.\n' +
      'La contraseña se hashea automáticamente con bcrypt.\n\n' +
      'Por defecto, los usuarios nuevos tienen rol "user".',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya existe',
    schema: {
      example: {
        statusCode: 400,
        message: 'El email ya está registrado',
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Obtener todos los usuarios
   * Solo administradores
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description:
      '**Solo Administradores**\n\n' +
      'Retorna lista paginada de todos los usuarios del sistema.\n' +
      'Incluye información completa excepto contraseñas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden ver todos los usuarios',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  /**
   * Obtener un usuario por ID
   * Usuario dueño o administrador
   */
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🔍 Obtener un usuario por ID',
    description:
      '**Requiere autenticación**\n\n' +
      'Retorna información de un usuario específico.\n' +
      'Solo el dueño de la cuenta o un administrador puede ver los detalles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo puedes ver tu propio perfil',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualizar información del usuario
   * Usuario dueño o administrador
   */
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar información de usuario',
    description:
      '**Requiere autenticación**\n\n' +
      'Permite actualizar datos del usuario.\n' +
      'Solo el dueño de la cuenta o un administrador pueden editarla.\n\n' +
      '**Nota:** No se puede cambiar el rol a menos que seas administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo puedes editar tu propio perfil',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Eliminar (desactivar) un usuario
   * Solo administradores
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      '**Solo Administradores**\n\n' +
      'Desactiva un usuario del sistema (soft delete).\n' +
      'El usuario no será eliminado físicamente, solo marcado como inactivo.\n\n' +
      '**ADVERTENCIA:** Esta acción impide que el usuario inicie sesión.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden eliminar usuarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
