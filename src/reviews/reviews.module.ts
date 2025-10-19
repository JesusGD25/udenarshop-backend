import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Product, OrderItem])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [TypeOrmModule, ReviewsService],
})
export class ReviewsModule {}
