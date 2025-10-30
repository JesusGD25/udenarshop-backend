import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: 'http://localhost:4200', // URL del frontend Angular
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de Swagger con autenticación JWT
  const config = new DocumentBuilder()
    .setTitle('Udenar Marketplace API')
    .setDescription(
      '🛒 API RESTful para marketplace universitario con autenticación JWT\n\n' +
      '## 🔐 Autenticación\n' +
      'Esta API usa JWT (JSON Web Tokens) para autenticación.\n\n' +
      '### Pasos para probar endpoints protegidos:\n' +
      '1. Ejecuta el seed: `GET /seed`\n' +
      '2. Haz login: `POST /auth/login` con credenciales de prueba\n' +
      '3. Copia el `access_token` de la respuesta\n' +
      '4. Haz clic en el botón **🔓 Authorize** arriba\n' +
      '5. Pega el token en el campo de valor\n' +
      '6. Haz clic en **Authorize** y luego **Close**\n' +
      '7. Ahora puedes probar todos los endpoints protegidos\n\n' +
      '### 👥 Credenciales de Prueba:\n' +
      '**Admin:** admin@shopudenar.com / Admin123!\n' +
      '**Usuario:** juan.perez@udenar.edu.co / User123!'
    )
    .setVersion('1.0')
    .setContact(
      'Udenar Shop Team',
      'https://github.com/tu-repo',
      'contact@udenarshop.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Autenticación', 'Endpoints de login y gestión de tokens JWT')
    .addTag('Productos', 'Gestión de productos del marketplace')
    .addTag('Categorías', 'Gestión de categorías de productos')
    .addTag('Carrito', 'Gestión del carrito de compras')
    .addTag('Favoritos', 'Gestión de productos favoritos')
    .addTag('Órdenes', 'Gestión de órdenes de compra')
    .addTag('Usuarios', 'Gestión de usuarios')
    .addTag('Mensajes', 'Sistema de mensajería entre usuarios')
    .addTag('Notificaciones', 'Sistema de notificaciones')
    .addTag('Seed', 'Endpoints para poblar la base de datos (solo desarrollo)')
    // Configurar autenticación Bearer JWT
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT (sin el prefijo "Bearer")',
        in: 'header',
      },
      'JWT-auth', // Nombre de la referencia de seguridad
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'Udenar Shop API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #5b21b6; }
    `,
    swaggerOptions: {
      persistAuthorization: true, // Mantener el token después de refrescar
      filter: true, // Habilitar búsqueda
      displayRequestDuration: true, // Mostrar duración de las peticiones
    },
  });

  // Habilitar validación global usando class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades extra
      transform: true, // Transforma los datos al tipo correcto (ej: "123" -> 123)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
