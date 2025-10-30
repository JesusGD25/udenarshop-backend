import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public() // Ruta pública - no requiere autenticación
  @Get()
  @ApiOperation({ 
    summary: '🌱 Ejecutar seed de base de datos',
    description: 
      '**Solo para desarrollo**\n\n' +
      'Limpia y puebla la base de datos con datos de prueba:\n' +
      '- 5 usuarios (1 admin, 4 usuarios regulares)\n' +
      '- 8 categorías\n' +
      '- 15 productos\n\n' +
      '⚠️ **ADVERTENCIA:** Elimina TODOS los datos existentes.\n\n' +
      '**Credenciales generadas:**\n' +
      '- Admin: admin@shopudenar.com / Admin123!\n' +
      '- Usuario: juan.perez@udenar.edu.co / User123!'
  })
  @ApiResponse({
    status: 200,
    description: '✅ Seed ejecutado exitosamente',
    schema: {
      example: {
        message: 'Seed ejecutado exitosamente',
        usersCreated: 5,
        categoriesCreated: 8,
        productsCreated: 15,
      },
    },
  })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
