import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Product])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [TypeOrmModule, FavoritesService],
})
export class FavoritesModule {}
