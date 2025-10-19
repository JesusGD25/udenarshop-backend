import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Category } from './entities/category.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Crear una nueva categoría
   */
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);

      return category;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtener todas las categorías con paginación opcional
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const categories = await this.categoryRepository.find({
      take: limit,
      skip: offset,
      order: {
        name: 'ASC',
      },
    });

    return categories;
  }

  /**
   * Obtener solo categorías activas
   */
  async findAllActive(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      take: limit,
      skip: offset,
      order: {
        name: 'ASC',
      },
    });

    return categories;
  }

  /**
   * Obtener una categoría por ID o por nombre/slug
   */
  async findOne(term: string) {
    let category: Category | null = null;

    // Si el término es un UUID, buscar por ID
    if (isUUID(term)) {
      category = await this.categoryRepository.findOne({
        where: { id: term },
      });
    } else {
      // Si no es UUID, buscar por slug o nombre (case insensitive)
      const queryBuilder = this.categoryRepository.createQueryBuilder('category');
      category = await queryBuilder
        .where('LOWER(category.slug) = LOWER(:term)', { term })
        .orWhere('LOWER(category.name) = LOWER(:term)', { term })
        .getOne();
    }

    if (!category) {
      throw new NotFoundException(
        `Categoría con término "${term}" no encontrada`,
      );
    }

    return category;
  }

  /**
   * Obtener una categoría con sus productos
   */
  async findOneWithProducts(term: string) {
    let category: Category | null = null;

    if (isUUID(term)) {
      category = await this.categoryRepository.findOne({
        where: { id: term },
        relations: ['products'],
      });
    } else {
      const queryBuilder = this.categoryRepository.createQueryBuilder('category');
      category = await queryBuilder
        .leftJoinAndSelect('category.products', 'products')
        .where('LOWER(category.slug) = LOWER(:term)', { term })
        .orWhere('LOWER(category.name) = LOWER(:term)', { term })
        .getOne();
    }

    if (!category) {
      throw new NotFoundException(
        `Categoría con término "${term}" no encontrada`,
      );
    }

    return category;
  }

  /**
   * Actualizar una categoría
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    try {
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Eliminar (desactivar) una categoría
   */
  async remove(id: string) {
    const category = await this.findOne(id);

    // Soft delete: solo marcar como inactiva
    category.isActive = false;
    await this.categoryRepository.save(category);

    return {
      message: `Categoría "${category.name}" desactivada exitosamente`,
    };
  }

  /**
   * Activar una categoría
   */
  async activate(id: string) {
    const category = await this.findOne(id);

    category.isActive = true;
    await this.categoryRepository.save(category);

    return {
      message: `Categoría "${category.name}" activada exitosamente`,
    };
  }

  /**
   * Eliminar permanentemente una categoría (solo para desarrollo/testing)
   */
  async hardDelete(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    return {
      message: `Categoría eliminada permanentemente`,
    };
  }

  /**
   * Contar productos por categoría
   */
  async countProducts(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalProducts: category.products.length,
    };
  }

  /**
   * Manejo de excepciones de base de datos
   */
  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revisar logs del servidor',
    );
  }
}
