import { IsEnum, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Método de pago seleccionado',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Dirección de envío',
    example: 'Calle 123 #45-67, Pasto, Nariño',
  })
  @IsString()
  @MinLength(10)
  shippingAddress: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales para la orden',
    example: 'Por favor, llamar antes de entregar',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
