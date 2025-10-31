import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../users/enums/role.enum';

/**
 * Controlador de productos
 * Maneja todas las peticiones HTTP relacionadas con productos
 * Base URL: /products
 * 
 * Rutas públicas (sin autenticación):
 * - GET /products (ver todos los productos)
 * - GET /products/:id (ver un producto)
 * 
 * Rutas protegidas (requieren autenticación):
 * - POST /products (crear producto)
 * - PATCH /products/:id (actualizar producto)
 * - DELETE /products/:id (eliminar producto - solo ADMIN)
 */
@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear un nuevo producto
   * Requiere autenticación
   */
  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear un nuevo producto',
    description: '**Requiere autenticación**\n\nCrea un nuevo producto en el marketplace. El usuario autenticado será el vendedor.'
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado - Se requiere token JWT',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  /**
   * Obtener todos los productos
   * Ruta pública - no requiere autenticación
   */
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los productos',
    description: '**Ruta pública**\n\nRetorna lista paginada de productos. Cualquiera puede ver los productos sin autenticación.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  /**
   * Búsqueda avanzada de productos con filtros
   * Ruta pública - no requiere autenticación
   */
  @Public()
  @Get('search')
  @ApiOperation({ 
    summary: 'Búsqueda avanzada de productos',
    description: '**Ruta pública**\n\nBusca productos con filtros por texto, categorías, precios, condición y ordenamiento.'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
  })
  search(@Query() searchDto: SearchProductsDto) {
    return this.productsService.search(searchDto);
  }

  /**
   * Obtener productos recientes
   * Ruta pública - no requiere autenticación
   */
  @Public()
  @Get('recent')
  @ApiOperation({ 
    summary: 'Obtener productos recientes',
    description: '**Ruta pública**\n\nRetorna los productos más recientemente publicados.'
  })
  @ApiResponse({
    status: 200,
    description: 'Productos recientes obtenidos exitosamente',
  })
  findRecent(@Query('limit') limit: number = 8) {
    return this.productsService.findRecent(limit);
  }

  /**
   * Obtener productos populares
   * Ruta pública - no requiere autenticación
   */
  @Public()
  @Get('popular')
  @ApiOperation({ 
    summary: 'Obtener productos populares',
    description: '**Ruta pública**\n\nRetorna los productos más populares por visualizaciones y favoritos.'
  })
  @ApiResponse({
    status: 200,
    description: 'Productos populares obtenidos exitosamente',
  })
  findPopular(@Query('limit') limit: number = 8) {
    return this.productsService.findPopular(limit);
  }

  /**
   * Obtener mis productos (del usuario autenticado)
   * Requiere autenticación
   */
  @Get('my-products')
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener mis productos',
    description: '**Requiere autenticación**\n\nRetorna lista paginada de productos del usuario autenticado.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tus productos obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado - Se requiere token JWT',
  })
  findMyProducts(
    @Query() paginationDto: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.findByUser(userId, paginationDto);
  }

  /**
   * Obtener un producto por ID o slug
   * Ruta pública - no requiere autenticación
   */
  @Public()
  @Get(':term')
  @ApiOperation({ 
    summary: 'Obtener un producto por ID o slug',
    description: '**Ruta pública**\n\nBusca un producto por su ID (UUID) o por su slug. Cualquiera puede ver los detalles sin autenticación.'
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  /**
   * Actualizar un producto
   * Requiere autenticación - Solo el dueño o admin
   */
  @Patch(':term')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar un producto',
    description: '**Requiere autenticación**\n\nActualiza un producto. Solo el dueño del producto o un administrador puede editarlo.'
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para editar este producto',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  update(
    @Param('term') term: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.update(term, updateProductDto, userId);
  }

  /**
   * Eliminar un producto
   * El usuario puede eliminar sus propios productos, los administradores pueden eliminar cualquiera
   */
  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar un producto',
    description: '**Requiere autenticación**\n\nElimina un producto del sistema. Los usuarios pueden eliminar solo sus propios productos. Los administradores pueden eliminar cualquier producto.'
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para eliminar este producto',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.productsService.remove(id, userId, userRole);
  }
}
