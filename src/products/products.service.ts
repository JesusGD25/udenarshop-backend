import {
  BadRequestException,
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


@Injectable()
export class ProductsService {
  // Logger para registrar errores y eventos importantes
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Crear la instancia del producto (aún no se guarda en BD)
      const product = this.productRepository.create(createProductDto);

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
   */
  async update(term: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Buscar el producto usando findOne (permite búsqueda por ID o slug)
    const product = await this.findOne(term);

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
   * Eliminar un producto (soft delete)
   * @param id - ID del producto a eliminar
   */
  async remove(id: string): Promise<Product> {
    const product = await this.findOne(id);

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
}
