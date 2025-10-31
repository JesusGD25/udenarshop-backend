import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateDescriptionDto, GenerateTitleDto } from './dto/generate-description.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('IA - Inteligencia Artificial')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Genera una descripción mejorada para un producto usando IA
   */
  @Public()
  @Post('generate-description')
  @ApiOperation({
    summary: 'Generar descripción de producto con IA',
    description: `**Ruta pública**
    
Genera una descripción atractiva y profesional para un producto usando Google Gemini AI.

La IA creará o mejorará la descripción basándose en:
- Título del producto
- Descripción actual (si existe)
- Categoría
- Precio

La descripción generada será:
- Clara y convincente (máx 200 palabras)
- Con tono amigable pero profesional
- Optimizada para marketplace universitario
- Con emojis relevantes`,
  })
  @ApiResponse({
    status: 200,
    description: 'Descripción generada exitosamente',
    schema: {
      example: {
        description: '📱 iPhone 14 Pro Max de 256GB en excelente estado...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al generar descripción (IA no disponible)',
  })
  async generateDescription(@Body() generateDescriptionDto: GenerateDescriptionDto) {
    const description = await this.aiService.generateProductDescription(generateDescriptionDto);
    
    return {
      description,
      generatedAt: new Date().toISOString(),
      service: 'Google Gemini AI',
    };
  }

  /**
   * Genera un título optimizado para un producto usando IA
   */
  @Public()
  @Post('generate-title')
  @ApiOperation({
    summary: 'Optimizar título de producto con IA',
    description: `**Ruta pública**
    
Mejora el título de un producto haciéndolo más atractivo y descriptivo usando IA.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Título optimizado exitosamente',
    schema: {
      example: {
        title: 'iPhone 14 Pro Max 256GB - Excelente Estado',
      },
    },
  })
  async generateTitle(@Body() generateTitleDto: GenerateTitleDto) {
    const title = await this.aiService.generateProductTitle(
      generateTitleDto.currentTitle,
      generateTitleDto.categoryName,
    );
    
    return {
      title,
      generatedAt: new Date().toISOString(),
      service: 'Google Gemini AI',
    };
  }

  /**
   * Verifica el estado del servicio de IA
   */
  @Public()
  @Post('status')
  @ApiOperation({
    summary: 'Verificar estado del servicio de IA',
    description: 'Verifica si el servicio de IA está disponible y configurado correctamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del servicio',
    schema: {
      example: {
        available: true,
        service: 'Google Gemini AI',
        message: 'Servicio de IA disponible',
      },
    },
  })
  async getStatus() {
    const isAvailable = this.aiService.isAvailable();
    
    return {
      available: isAvailable,
      service: 'Google Gemini AI',
      message: isAvailable
        ? 'Servicio de IA disponible'
        : 'Servicio de IA no disponible. Configura GEMINI_API_KEY en .env',
    };
  }

  /**
   * Genera términos de búsqueda relacionados usando IA
   */
  @Public()
  @Post('search-terms')
  @ApiOperation({
    summary: 'Generar términos de búsqueda relacionados con IA',
    description: `**Ruta pública**
    
Genera términos de búsqueda relacionados, sinónimos y variaciones usando IA para mejorar los resultados de búsqueda.

Ejemplos:
- "auriculares" → auriculares, audífonos, cascos, headphones, AirPods, etc.
- "iPhone" → iPhone, teléfono, smartphone, celular, Apple, etc.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Términos generados exitosamente',
    schema: {
      example: {
        query: 'auriculares',
        terms: ['auriculares', 'audífonos', 'cascos', 'headphones', 'airpods'],
        generatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async generateSearchTerms(@Body() body: { query: string }) {
    const terms = await this.aiService.generateSearchTerms(body.query);
    
    return {
      query: body.query,
      terms,
      generatedAt: new Date().toISOString(),
    };
  }
}
