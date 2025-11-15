import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentMethod } from './enums/payment-method.enum';
import { ProcessPaymentDto } from './dto/process-payment.dto';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

@Injectable()
export class PaymentService {
  /**
   * Simula el procesamiento de un pago
   * En producción, aquí se integraría con una pasarela real (Stripe, PayU, etc.)
   */
  async processPayment(
    amount: number,
    paymentDto: ProcessPaymentDto,
  ): Promise<PaymentResult> {
    const { paymentMethod, cardNumber } = paymentDto;

    // Simulación de delay de red
    await this.simulateNetworkDelay();

    switch (paymentMethod) {
      case PaymentMethod.CARD:
        return this.processCardPayment(amount, cardNumber);

      case PaymentMethod.CASH:
        return this.processCashPayment(amount);

      case PaymentMethod.TRANSFER:
        return this.processTransferPayment(amount);

      default:
        throw new BadRequestException('Método de pago no válido');
    }
  }

  /**
   * Simular pago con tarjeta
   */
  private async processCardPayment(
    amount: number,
    cardNumber?: string,
  ): Promise<PaymentResult> {
    // Validación básica de tarjeta de prueba
    if (!cardNumber) {
      throw new BadRequestException('Número de tarjeta requerido');
    }

    // Tarjetas de prueba que siempre aprueban
    const approvedCards = ['4242424242424242', '5555555555554444'];
    
    // Tarjetas de prueba que siempre rechazan
    const declinedCards = ['4000000000000002'];

    if (declinedCards.includes(cardNumber)) {
      return {
        success: false,
        transactionId: '',
        message: 'Tarjeta rechazada por el banco',
      };
    }

    if (!approvedCards.includes(cardNumber) && !this.isValidCardNumber(cardNumber)) {
      throw new BadRequestException('Número de tarjeta inválido');
    }

    // Simulación exitosa
    const transactionId = this.generateTransactionId();
    
    return {
      success: true,
      transactionId,
      message: `Pago de $${amount.toLocaleString('es-CO')} aprobado exitosamente`,
    };
  }

  /**
   * Simular pago en efectivo
   */
  private async processCashPayment(amount: number): Promise<PaymentResult> {
    // El pago en efectivo siempre se acepta (se paga al recibir)
    const transactionId = this.generateTransactionId();
    
    return {
      success: true,
      transactionId,
      message: `Orden confirmada. Pago en efectivo de $${amount.toLocaleString('es-CO')} al recibir`,
    };
  }

  /**
   * Simular pago por transferencia
   */
  private async processTransferPayment(amount: number): Promise<PaymentResult> {
    // La transferencia siempre se acepta (pendiente de confirmación)
    const transactionId = this.generateTransactionId();
    
    return {
      success: true,
      transactionId,
      message: `Orden confirmada. Transferencia de $${amount.toLocaleString('es-CO')} pendiente de verificación`,
    };
  }

  /**
   * Generar ID de transacción único
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 999999);
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Validación básica de número de tarjeta usando algoritmo de Luhn
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Simular delay de red (100-500ms)
   */
  private simulateNetworkDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 400) + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
