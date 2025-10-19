import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Product])],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
