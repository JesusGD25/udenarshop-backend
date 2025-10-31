import { IsString, IsOptional, IsNumber, MaxLength, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDescriptionDto {
  @ApiProperty({
    description: 'Título del producto',
    example: 'iPhone 14 Pro Max 256GB',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción actual del producto (opcional)',
    example: 'Teléfono en buen estado',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  currentDescription?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
  })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({
    description: 'Precio del producto',
    example: 3500000,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'URLs de las imágenes del producto (máximo 5)',
    example: ['https://res.cloudinary.com/...', 'https://res.cloudinary.com/...'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images?: string[];
}

export class GenerateTitleDto {
  @ApiProperty({
    description: 'Título actual del producto',
    example: 'iphone 14 pro',
  })
  @IsString()
  @MaxLength(200)
  currentTitle: string;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Electrónica',
  })
  @IsString()
  @IsOptional()
  categoryName?: string;
}
