import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/payment-method.enum';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Número de tarjeta (para pago con tarjeta)',
    example: '4242424242424242',
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'CVV de la tarjeta',
    example: '123',
  })
  @IsOptional()
  @IsString()
  cvv?: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración (MM/YY)',
    example: '12/25',
  })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}
