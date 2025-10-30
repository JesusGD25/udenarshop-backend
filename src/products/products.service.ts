import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';


@Injectable()
export class ProductsService {
  // Logger para registrar errores y eventos importantes
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  
  /**
   * Crear un nuevo producto
   * @param createProductDto - Datos del producto
   * @param userId - ID del usuario autenticado (vendedor)
   */
  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    // 1. Validar que el usuario exista y esté activo
    await this.validateUser(userId);

    // 2. Validar que la categoría exista y esté activa (si se proporciona)
    if (createProductDto.categoryId) {
      await this.validateCategory(createProductDto.categoryId);
    }

    // 3. Validar el precio
    this.validatePrice(createProductDto.price);

    // 4. Validar el stock
    if (createProductDto.stock !== undefined) {
      this.validateStock(createProductDto.stock);
    }

    // 5. Validar imágenes (si se proporcionan)
    if (createProductDto.images && createProductDto.images.length > 0) {
      this.validateImages(createProductDto.images);
    }

    try {
      // Crear la instancia del producto con el sellerId
      const product = this.productRepository.create({
        ...createProductDto,
        sellerId: userId,
      });

      // Guardar en la base de datos
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtener todos los productos con paginación opcional
   * @param paginationDto - Parámetros de paginación (limit, offset)
   */
  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this.productRepository.find({
        take: limit, // Límite de resultados (equivalente a LIMIT en SQL)
        skip: offset, // Saltar N resultados (equivalente a OFFSET en SQL)
        order: {
          createdAt: 'DESC', // Ordenar por fecha de creación, más recientes primero
        },
      });

      return products;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtener todos los productos de un usuario específico
   * @param userId - ID del usuario vendedor
   * @param paginationDto - Parámetros de paginación (limit, offset)
   */
  async findByUser(userId: string, paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this.productRepository.find({
        where: { sellerId: userId },
        take: limit,
        skip: offset,
        order: {
          createdAt: 'DESC',
        },
      });

      return products;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Buscar un producto por ID o slug
   */
  async findOne(term: string): Promise<Product> {
    let product: Product | null;

    // Verificar si el término es un UUID
    if (this.isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // Si no es UUID, buscar por slug
      product = await this.productRepository.findOneBy({ slug: term });
    }

    if (!product) {
      throw new NotFoundException(`Product with term "${term}" not found`);
    }

    return product;
  }

  /**
   * Actualizar un producto existente
   * Ahora permite buscar por ID (UUID) o por slug
   * @param term - ID (UUID) o slug del producto a actualizar
   * @param updateProductDto - Datos a actualizar
   * @param userId - ID del usuario autenticado
   */
  async update(
    term: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<Product> {
    // 1. Buscar el producto
    const product = await this.findOne(term);

    // 2. Validar que el usuario sea el dueño del producto
    this.validateProductOwnership(product, userId);

    // 3. Validar categoría si se está actualizando
    if (updateProductDto.categoryId) {
      await this.validateCategory(updateProductDto.categoryId);
    }

    // 4. Validar precio si se está actualizando
    if (updateProductDto.price !== undefined) {
      this.validatePrice(updateProductDto.price);
    }

    // 5. Validar stock si se está actualizando
    if (updateProductDto.stock !== undefined) {
      this.validateStock(updateProductDto.stock);
    }

    // 6. Validar imágenes si se están actualizando
    if (updateProductDto.images && updateProductDto.images.length > 0) {
      this.validateImages(updateProductDto.images);
    }

    // Aplicar los cambios del DTO al producto encontrado
    Object.assign(product, updateProductDto);

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Eliminar un producto
   * @param id - ID del producto a eliminar
   * @param userId - ID del usuario que intenta eliminar
   * @param userRole - Rol del usuario
   */
  async remove(id: string, userId: string, userRole: string): Promise<Product> {
    const product = await this.findOne(id);

    // Verificar permisos: solo el dueño o un admin pueden eliminar
    if (product.sellerId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    try {
      await this.productRepository.remove(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Manejo centralizado de errores de base de datos
   * @param error - Error capturado
   * @throws BadRequestException para errores de duplicados
   * @throws InternalServerErrorException para otros errores
   */
  private handleDBExceptions(error: any): never {
    // Error de duplicado (código 23505 en PostgreSQL)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    // Registrar el error en los logs
    this.logger.error(error);

    // Lanzar error genérico
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  /**
   * Validar si un string es un UUID válido
   * @param term - String a validar
   * @returns true si es UUID válido
   */
  private isUUID(term: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(term);
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================

  /**
   * Validar que el usuario exista y esté activo
   * @param userId - ID del usuario a validar
   * @throws NotFoundException si el usuario no existe
   * @throws BadRequestException si el usuario está inactivo
   */
  private async validateUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Tu cuenta está inactiva. Contacta al administrador.',
      );
    }
  }

  /**
   * Validar que la categoría exista y esté activa
   * @param categoryId - ID de la categoría a validar
   * @throws NotFoundException si la categoría no existe
   * @throws BadRequestException si la categoría está inactiva
   */
  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id: categoryId });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID "${categoryId}" no encontrada`,
      );
    }

    if (!category.isActive) {
      throw new BadRequestException(
        `La categoría "${category.name}" está desactivada. Elige otra categoría.`,
      );
    }
  }

  /**
   * Validar que el precio sea válido
   * @param price - Precio a validar
   * @throws BadRequestException si el precio no es válido
   */
  private validatePrice(price: number): void {
    if (!price || price <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    // Validar que sea un número entero (COP no usa decimales)
    if (!Number.isInteger(price)) {
      throw new BadRequestException(
        'El precio debe ser un número entero (sin decimales)',
      );
    }

    // Validar que no sea un precio demasiado alto (mayor a $999,999,999 COP)
    if (price > 999999999) {
      throw new BadRequestException(
        'El precio no puede ser mayor a $999.999.999 COP',
      );
    }

    // Validar que no sea un precio demasiado bajo (menor a $1000 COP)
    if (price < 1000) {
      throw new BadRequestException(
        'El precio debe ser mínimo $1.000 COP',
      );
    }
  }

  /**
   * Validar que el stock sea válido
   * @param stock - Stock a validar
   * @throws BadRequestException si el stock no es válido
   */
  private validateStock(stock: number): void {
    if (stock === undefined || stock === null) {
      return; // El stock es opcional
    }

    if (stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    if (!Number.isInteger(stock)) {
      throw new BadRequestException('El stock debe ser un número entero');
    }

    // Límite razonable de stock
    if (stock > 10000) {
      throw new BadRequestException(
        'El stock no puede ser mayor a 10.000 unidades',
      );
    }
  }

  /**
   * Validar que las imágenes sean URLs válidas
   * @param images - Array de URLs de imágenes
   * @throws BadRequestException si las URLs no son válidas
   */
  private validateImages(images: string[]): void {
    if (!Array.isArray(images)) {
      throw new BadRequestException('Las imágenes deben ser un array');
    }

    // Máximo 10 imágenes por producto
    if (images.length > 10) {
      throw new BadRequestException(
        'No puedes subir más de 10 imágenes por producto',
      );
    }

    // Validar que cada imagen sea una URL válida
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i;
    
    images.forEach((image, index) => {
      if (!image || typeof image !== 'string') {
        throw new BadRequestException(
          `La imagen en la posición ${index + 1} no es válida`,
        );
      }

      if (!urlRegex.test(image)) {
        throw new BadRequestException(
          `La imagen en la posición ${index + 1} debe ser una URL válida (jpg, jpeg, png, gif, webp, svg)`,
        );
      }
    });
  }

  /**
   * Validar que el usuario sea el dueño del producto
   * @param product - Producto a validar
   * @param userId - ID del usuario autenticado
   * @throws ForbiddenException si el usuario no es el dueño
   */
  private validateProductOwnership(product: Product, userId: string): void {
    if (product.sellerId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este producto. Solo el vendedor puede editarlo.',
      );
    }
  }
}
