import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { initialProducts } from './data/products.data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    await this.insertProducts();
    
    return {
      message: 'Seed ejecutado exitosamente',
      productsCreated: initialProducts.length,
    };
  }

  private async deleteTables() {
    // Eliminar todos los productos usando query builder
    await this.productRepository
      .createQueryBuilder()
      .delete()
      .from(Product)
      .execute();
  }

  private async insertProducts() {
    const products = this.productRepository.create(initialProducts);
    await this.productRepository.save(products);
  }
}
