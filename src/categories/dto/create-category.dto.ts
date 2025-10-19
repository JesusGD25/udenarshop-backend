import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
