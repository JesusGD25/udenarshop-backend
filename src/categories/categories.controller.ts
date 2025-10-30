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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

/**
 * Controlador de categorías
 * 
 * Protección de rutas:
 * - GET /categories: Pública (ver todas las categorías)
 * - GET /categories/active: Pública (ver categorías activas)
 * - GET /categories/:term: Pública (buscar por ID o slug)
 * - GET /categories/:term/products: Pública (productos de una categoría)
 * - GET /categories/:id/count: Pública (contar productos)
 * - POST /categories: Solo ADMIN
 * - PATCH /categories/:id: Solo ADMIN
 * - PATCH /categories/:id/activate: Solo ADMIN
 * - DELETE /categories/:id: Solo ADMIN
 */
@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear nueva categoría
   * Solo administradores
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '➕ Crear nueva categoría',
    description:
      '**Solo Administradores**\n\n' +
      'Crea una nueva categoría en el sistema.\n' +
      'El slug se genera automáticamente a partir del nombre.\n\n' +
      '**Campos requeridos:** name, description',
  })
  @ApiResponse({
    status: 201,
    description: '✅ Categoría creada exitosamente',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'Electrónicos',
        slug: 'electronicos',
        description: 'Dispositivos electrónicos y accesorios',
        isActive: true,
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '⚠️ Datos inválidos o categoría duplicada',
  })
  @ApiResponse({
    status: 401,
    description: '❌ No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: '🚫 Solo administradores pueden crear categorías',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Obtener todas las categorías
   * Ruta pública
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: '📁 Listar todas las categorías',
    description:
      '**Ruta pública**\n\n' +
      'Retorna todas las categorías del sistema (activas e inactivas).\n' +
      'Soporta paginación con limit y offset.\n\n' +
      'Útil para administradores que necesitan ver categorías desactivadas.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lista de categorías obtenida',
    schema: {
      example: [
        {
          id: 'uuid-123',
          name: 'Electrónicos',
          slug: 'electronicos',
          description: 'Dispositivos electrónicos y accesorios',
          isActive: true,
        },
        {
          id: 'uuid-456',
          name: 'Ropa',
          slug: 'ropa',
          description: 'Prendas de vestir',
          isActive: false,
        },
      ],
    },
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAll(paginationDto);
  }

  /**
   * Obtener solo categorías activas
   * Ruta pública
   */
  @Public()
  @Get('active')
  @ApiOperation({
    summary: 'Listar categorías activas',
    description:
      '**Ruta pública**\n\n' +
      'Retorna solo las categorías activas (isActive = true).\n' +
      'Ideal para mostrar en el frontend a usuarios finales.\n\n' +
      'Excluye categorías desactivadas por administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías activas obtenidas',
  })
  findAllActive(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAllActive(paginationDto);
  }

  /**
   * Buscar categoría por ID o slug
   * Ruta pública
   */
  @Public()
  @Get(':term')
  @ApiOperation({
    summary: 'Buscar categoría por ID o slug',
    description:
      '**Ruta pública**\n\n' +
      'Permite buscar una categoría usando:\n' +
      '- **UUID**: ID único de la categoría\n' +
      '- **Slug**: Nombre amigable para URLs (ej: "electronicos")\n\n' +
      'El sistema detecta automáticamente el tipo de término.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  findOne(@Param('term') term: string) {
    return this.categoriesService.findOne(term);
  }

  /**
   * Obtener productos de una categoría
   * Ruta pública
   */
  @Public()
  @Get(':term/products')
  @ApiOperation({
    summary: 'Obtener productos de una categoría',
    description:
      '**Ruta pública**\n\n' +
      'Retorna todos los productos asociados a una categoría específica.\n' +
      'Puedes usar el ID o slug de la categoría.\n\n' +
      'Incluye relaciones completas con el vendedor y la categoría.',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría obtenidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  findOneWithProducts(@Param('term') term: string) {
    return this.categoriesService.findOneWithProducts(term);
  }

  /**
   * Contar productos de una categoría
   * Ruta pública
   */
  @Public()
  @Get(':id/count')
  @ApiOperation({
    summary: 'Contar productos en una categoría',
    description:
      '**Ruta pública**\n\n' +
      'Retorna el número total de productos asociados a la categoría.\n' +
      'Útil para mostrar estadísticas sin cargar todos los productos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conteo obtenido',
    schema: {
      example: {
        categoryId: 'uuid-123',
        categoryName: 'Electrónicos',
        productCount: 42,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  countProducts(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.countProducts(id);
  }

  /**
   * Actualizar categoría existente
   * Solo administradores
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description:
      '**Solo Administradores**\n\n' +
      'Permite editar información de una categoría existente.\n' +
      'Todos los campos son opcionales.\n\n' +
      'Si cambias el nombre, el slug se regenera automáticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden editar categorías',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Activar una categoría desactivada
   * Solo administradores
   */
  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Activar categoría',
    description:
      '**Solo Administradores**\n\n' +
      'Reactiva una categoría previamente desactivada.\n' +
      'Cambia isActive de false a true.\n\n' +
      'Útil para restaurar categorías temporalmente deshabilitadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría activada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden activar categorías',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.activate(id);
  }

  /**
   * Eliminar (desactivar) categoría
   * Solo administradores
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar categoría',
    description:
      '**Solo Administradores**\n\n' +
      'Desactiva una categoría (soft delete).\n' +
      'La categoría no se elimina físicamente, solo se marca como inactiva.\n\n' +
      '**NOTA:** Los productos asociados permanecen en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría desactivada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores pueden eliminar categorías',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
