import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(private configService: ConfigService) {
    // Obtener la API key de las variables de entorno
    // Intentar primero con ConfigService, luego con process.env como fallback
    let apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      // Fallback a process.env directamente
      apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.logger.warn('⚠️ API Key encontrada en process.env (no en ConfigService)');
      }
    }
    
    this.logger.log(`🔍 Verificando API Key: ${apiKey ? 'Encontrada (longitud: ' + apiKey.length + ')' : 'NO encontrada'}`);
    
    if (!apiKey) {
      this.logger.error('❌ GEMINI_API_KEY no está configurada. El servicio de IA no funcionará.');
      this.logger.error('📋 Variables de entorno disponibles:', Object.keys(process.env));
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Usar gemini-2.5-flash - Modelo más reciente, rápido y gratuito
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash'
        });
        this.logger.log('✅ Servicio de IA inicializado correctamente con Gemini 2.5 Flash');
      } catch (error) {
        this.logger.error('❌ Error al inicializar Gemini:', error.message);
      }
    }
  }

  /**
   * Genera una descripción mejorada para un producto
   */
  async generateProductDescription(data: {
    title: string;
    currentDescription?: string;
    categoryName?: string;
    price?: number;
    images?: string[];
  }): Promise<string> {
    if (!this.model) {
      throw new Error('Servicio de IA no está disponible. Configura GEMINI_API_KEY en .env');
    }

    try {
      const { title, currentDescription, categoryName, price, images } = data;

      // Construir el prompt base
      let promptText = `Eres un asistente especializado en crear descripciones de productos para un marketplace universitario llamado "UdenarShop".

${images && images.length > 0 ? 'Analiza las imágenes del producto proporcionadas.' : ''}

INFORMACIÓN DEL PRODUCTO:
- Título: ${title}
${categoryName ? `- Categoría: ${categoryName}` : ''}
${price ? `- Precio: $${price.toLocaleString('es-CO')} COP` : ''}
${currentDescription ? `- Info adicional: ${currentDescription}` : ''}

INSTRUCCIONES IMPORTANTES:
1. Genera ÚNICAMENTE la descripción del producto, sin introducciones, saludos ni texto adicional
2. NO incluyas frases como "Aquí tienes...", "¡Absolutamente!", "---", ni títulos adicionales
3. Comienza directamente con la descripción del producto
4. ${images && images.length > 0 ? 'Describe lo que ves en las imágenes: estado físico, color, características visibles, accesorios incluidos' : 'Basa la descripción en el título y categoría proporcionados'}
5. Máximo 200 palabras, tono amigable pero profesional
6. Incluye 2-3 emojis relevantes al producto
7. Enfócate en lo atractivo para estudiantes universitarios
8. NO inventes características que no puedas confirmar

GENERA LA DESCRIPCIÓN:`;

      // Si hay imágenes, crear un contenido multimodal
      let content;
      if (images && images.length > 0) {
        this.logger.log(`🖼️ Analizando ${images.length} imagen(es) del producto "${title}"`);
        
        // Limitar a las primeras 3 imágenes para no sobrecargar la API
        const imagesToAnalyze = images.slice(0, 3);
        
        // Crear partes del contenido: texto + imágenes
        const parts: any[] = [
          { text: promptText }
        ];

        // Añadir cada imagen como parte del contenido
        for (const imageUrl of imagesToAnalyze) {
          try {
            // Descargar la imagen y convertirla a base64
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString('base64');
            
            // Detectar el tipo MIME de la imagen
            const mimeType = response.headers.get('content-type') || 'image/jpeg';
            
            parts.push({
              inlineData: {
                mimeType,
                data: base64Image
              }
            });
          } catch (imgError) {
            this.logger.warn(`⚠️ No se pudo cargar imagen: ${imageUrl}`, imgError.message);
          }
        }

        content = parts;
      } else {
        // Si no hay imágenes, usar solo texto
        content = promptText;
      }

      const result = await this.model.generateContent(content);
      const response = await result.response;
      let generatedText = response.text();

      // Limpiar texto no deseado
      generatedText = this.cleanGeneratedText(generatedText);

      this.logger.log(`✅ Descripción generada para: "${title}" ${images && images.length > 0 ? `(con ${images.length} imágenes)` : ''}`);
      return generatedText.trim();

    } catch (error) {
      this.logger.error('❌ Error al generar descripción con IA:');
      this.logger.error('Tipo de error:', error.constructor.name);
      this.logger.error('Mensaje:', error.message);
      this.logger.error('Stack:', error.stack);
      if (error.response) {
        this.logger.error('Respuesta de API:', JSON.stringify(error.response, null, 2));
      }
      
      // Si falla, retornar una descripción básica
      if (data.currentDescription) {
        return data.currentDescription;
      }
      
      throw new Error(`No se pudo generar la descripción: ${error.message}`);
    }
  }

  /**
   * Genera un título optimizado para SEO
   */
  async generateProductTitle(currentTitle: string, categoryName?: string): Promise<string> {
    if (!this.model) {
      throw new Error('Servicio de IA no está disponible. Configura GEMINI_API_KEY en .env');
    }

    try {
      const prompt = `Mejora este título de producto para un marketplace:

**Título actual:** ${currentTitle}
${categoryName ? `**Categoría:** ${categoryName}` : ''}

**Instrucciones:**
1. Hazlo más claro, atractivo y descriptivo
2. Máximo 100 caracteres
3. Incluye palabras clave relevantes
4. Mantén la información esencial
5. NO agregues emojis
6. Retorna SOLO el título mejorado, sin explicaciones

**Título mejorado:**`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      this.logger.log(`✅ Título optimizado generado`);
      return generatedText.trim();

    } catch (error) {
      this.logger.error('❌ Error al generar título con IA:', error);
      return currentTitle;
    }
  }

  /**
   * Verifica si el servicio de IA está disponible
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Limpia el texto generado removiendo introducciones y formato no deseado
   */
  private cleanGeneratedText(text: string): string {
    // Eliminar líneas de introducción comunes
    const unwantedPhrases = [
      /^¡?Absolutamente!?\s*/i,
      /^Claro!?\s*/i,
      /^Por supuesto!?\s*/i,
      /^Aquí tienes.*?:\s*/i,
      /^Aquí está.*?:\s*/i,
      /^Esta es.*?:\s*/i,
      /^Te presento.*?:\s*/i,
      /^---+\s*/g,  // Líneas separadoras
      /^\*\*Título:?\*\*.*$/gm,  // Líneas de título
      /^\*\*Descripción.*?:?\*\*\s*/gm,  // Encabezados de descripción
    ];

    let cleanedText = text;

    // Aplicar todas las expresiones regulares
    unwantedPhrases.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    // Eliminar líneas vacías al inicio
    cleanedText = cleanedText.replace(/^\s*\n+/, '');

    // Eliminar múltiples saltos de línea consecutivos
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');

    return cleanedText.trim();
  }

  /**
   * Genera términos de búsqueda relacionados y sinónimos
   */
  async generateSearchTerms(query: string): Promise<string[]> {
    if (!this.model) {
      // Si no hay IA disponible, solo retornar el query original
      return [query];
    }

    try {
      const prompt = `Eres un asistente experto en búsqueda de productos en un marketplace universitario.

TÉRMINO DE BÚSQUEDA: "${query}"

INSTRUCCIONES:
1. Genera una lista de términos relacionados, sinónimos y variaciones que alguien podría usar para buscar el mismo tipo de producto
2. Incluye términos en español e inglés si son comunes
3. Piensa en marcas populares que correspondan a ese tipo de producto
4. Máximo 10 términos
5. Retorna SOLO los términos separados por comas, sin numeración ni explicaciones
6. Si el término es una marca específica (como "iPhone"), incluye el término genérico ("teléfono", "smartphone")
7. Si es un término genérico, incluye marcas populares de ese producto

EJEMPLO:
Búsqueda: "auriculares"
Respuesta: auriculares,audífonos,cascos,headphones,earphones,AirPods,audifonos bluetooth,auriculares inalambricos

Ahora genera los términos para: "${query}"

TÉRMINOS:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text().trim();

      // Parsear los términos (separados por comas)
      const terms = generatedText
        .split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 0 && term.length < 100)
        .slice(0, 10); // Limitar a 10 términos

      // Siempre incluir el término original
      if (!terms.includes(query.toLowerCase())) {
        terms.unshift(query.toLowerCase());
      }

      this.logger.log(`✅ Términos de búsqueda generados para "${query}": ${terms.join(', ')}`);
      return terms;

    } catch (error) {
      this.logger.error('❌ Error al generar términos de búsqueda con IA:', error.message);
      // En caso de error, retornar solo el query original
      return [query];
    }
  }
}
