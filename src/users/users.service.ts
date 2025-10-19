import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // No retornar la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Obtener todos los usuarios con paginación opcional
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        address: true,
        isActive: true,
        rating: true,
        totalReviews: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        address: true,
        isActive: true,
        rating: true,
        totalReviews: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Obtener un usuario por email (útil para autenticación)
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    try {
      await this.userRepository.save(user);

      // No retornar la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Eliminar (desactivar) un usuario
   */
  async remove(id: string) {
    const user = await this.findOne(id);

    // Soft delete: solo marcar como inactivo
    user.isActive = false;
    await this.userRepository.save(user);

    return {
      message: `Usuario ${user.name} desactivado exitosamente`,
    };
  }

  /**
   * Eliminar permanentemente un usuario (solo para desarrollo/testing)
   */
  async hardDelete(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);

    return {
      message: `Usuario eliminado permanentemente`,
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
