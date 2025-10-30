import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';



@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, //localhost
      port: +(process.env.DB_PORT ?? 5433),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    ProductsModule,

    SeedModule,

    UsersModule,

    AuthModule,

    CategoriesModule,

    CartModule,

    CartItemModule,

    OrdersModule,

    OrderItemsModule,

    FavoritesModule,

    ReviewsModule,

    ChatModule,

    MessagesModule,

    NotificationsModule,

 
  ],
  providers: [
    // Aplicar JwtAuthGuard globalmente a todas las rutas
    // Las rutas públicas deben usar el decorador @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Aplicar RolesGuard globalmente para verificación de roles
    // Las rutas que requieren roles específicos usan @Roles(Role.ADMIN)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

})
export class AppModule {}
