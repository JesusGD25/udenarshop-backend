import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Configurar Cloudinary directamente (hardcoded para desarrollo)
    const cloudName = 'dlfppw8oy';
    const apiKey = '626973315368541';
    const apiSecret = 'vLf04M16L7v1BWBEi0Kei0ZzJCs';

    console.log('🔧 Configurando Cloudinary...');
    console.log('Cloud Name:', cloudName);
    console.log('API Key:', '***' + apiKey.slice(-4));
    console.log('API Secret:', '***' + apiSecret.slice(-4));

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('✅ Cloudinary configurado correctamente');
  }

  /**
   * Sube una imagen a Cloudinary
   * @param file - Archivo a subir (buffer o path)
   * @param folder - Carpeta en Cloudinary (opcional)
   * @returns URL de la imagen subida
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'udenarshop/products',
  ): Promise<string> {
    try {
      // Validar que sea una imagen
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('El archivo debe ser una imagen');
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        throw new BadRequestException('La imagen no debe superar 5MB');
      }

      // Subir a Cloudinary usando el buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' }, // Redimensionar si es muy grande
              { quality: 'auto' }, // Optimizar calidad automáticamente
              { fetch_format: 'auto' }, // Formato óptimo (WebP si el navegador lo soporta)
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        // Escribir el buffer al stream
        uploadStream.end(file.buffer);
      });

      return (result as any).secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new BadRequestException(
        'Error al subir la imagen. Por favor, intente nuevamente.',
      );
    }
  }

  /**
   * Sube múltiples imágenes a Cloudinary
   * @param files - Array de archivos
   * @param folder - Carpeta en Cloudinary
   * @returns Array de URLs
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'udenarshop/products',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param imageUrl - URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el public_id de la URL
      const parts = imageUrl.split('/');
      const fileName = parts[parts.length - 1].split('.')[0];
      const folder = parts.slice(-3, -1).join('/');
      const publicId = `${folder}/${fileName}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      // No lanzar error, solo registrar (la imagen puede ya no existir)
    }
  }
}
