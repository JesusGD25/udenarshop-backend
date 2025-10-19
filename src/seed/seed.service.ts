import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { initialProducts } from './data/products.data';
import { initialUsers } from './data/users.data';
import { initialCategories } from './data/categories.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async runSeed() {
    this.logger.log('Iniciando seed de base de datos...');
    
    // 1. Limpiar todas las tablas
    await this.deleteTables();
    this.logger.log('Tablas limpiadas');

    // 2. Insertar usuarios
    const users = await this.insertUsers();
    this.logger.log(`${users.length} usuarios creados`);

    // 3. Insertar categorías
    const categories = await this.insertCategories();
    this.logger.log(`${categories.length} categorías creadas`);

    // 4. Insertar productos (asignando vendedores y categorías)
    const products = await this.insertProducts(users, categories);
    this.logger.log(`${products.length} productos creados`);
    
    return {
      message: 'Seed ejecutado exitosamente',
      usersCreated: users.length,
      categoriesCreated: categories.length,
      productsCreated: products.length,
    };
  }

  private async deleteTables() {
    // Eliminar en orden correcto debido a las foreign keys
    // 1. Primero las tablas que dependen de otras
    
    // Notificaciones
    await this.productRepository.query('DELETE FROM notifications');
    
    // Mensajes y Chats
    await this.productRepository.query('DELETE FROM messages');
    await this.productRepository.query('DELETE FROM chats');
    
    // Reviews
    await this.productRepository.query('DELETE FROM reviews');
    
    // Favoritos
    await this.productRepository.query('DELETE FROM favorites');
    
    // Order items y Orders
    await this.productRepository.query('DELETE FROM order_items');
    await this.productRepository.query('DELETE FROM orders');
    
    // Cart items y Carts
    await this.productRepository.query('DELETE FROM cart_items');
    await this.productRepository.query('DELETE FROM carts');
    
    // Productos
    await this.productRepository.query('DELETE FROM products');
    
    // Categorías
    await this.productRepository.query('DELETE FROM categories');
    
    // Usuarios (al final porque muchas tablas dependen de esta)
    await this.productRepository.query('DELETE FROM users');

    this.logger.log('Todas las tablas limpiadas correctamente');
  }

  private async insertUsers() {
    const users: User[] = [];

    for (const userData of initialUsers) {
      const { password, ...rest } = userData;
      
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = this.userRepository.create({
        ...rest,
        password: hashedPassword,
      });
      
      users.push(user);
    }

    await this.userRepository.save(users);
    return users;
  }

  private async insertCategories() {
    const categories: Category[] = [];

    for (const categoryData of initialCategories) {
      const category = this.categoryRepository.create(categoryData);
      categories.push(category);
    }

    await this.categoryRepository.save(categories);
    return categories;
  }

  private async insertProducts(users: User[], categories: Category[]) {
    const products: Product[] = [];

    // Obtener usuarios regulares (no admin) para asignar como vendedores
    const sellers = users.filter(user => user.role === 'user');

    // Mapeo de productos a categorías (por índice aproximado de contenido)
    const productCategoryMap = [
      0, // iPhone 13 Pro Max -> Electrónica
      0, // MacBook Pro -> Electrónica
      0, // AirPods Pro -> Electrónica
      0, // Samsung Tab -> Electrónica
      6, // PlayStation 5 -> Videojuegos y Consolas
      3, // Bicicleta Trek -> Deportes y Fitness
      0, // Sony WH-1000XM5 -> Electrónica
      4, // Escritorio Gamer -> Hogar y Muebles
      7, // Canon EOS Rebel -> Fotografía y Cámaras
      0, // Apple Watch -> Electrónica
      6, // Nintendo Switch -> Videojuegos y Consolas
      5, // Guitarra Yamaha -> Instrumentos Musicales
      2, // Tenis Nike -> Ropa y Accesorios
      0, // Monitor LG -> Electrónica
      1, // Kindle -> Libros y Material Educativo
    ];

    // Distribuir productos entre los vendedores y asignar categorías
    initialProducts.forEach((productData, index) => {
      // Rotar entre los vendedores disponibles
      const seller = sellers[index % sellers.length];
      
      // Asignar categoría según el mapeo
      const categoryIndex = productCategoryMap[index];
      const category = categories[categoryIndex] || categories[0]; // Fallback a Electrónica

      const product = this.productRepository.create({
        ...productData,
        sellerId: seller.id,
        categoryId: category.id,
      });

      products.push(product);
    });

    await this.productRepository.save(products);
    return products;
  }
}
