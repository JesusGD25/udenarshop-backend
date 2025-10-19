/**
 * PaymentMethod Enum - Métodos de pago disponibles
 * 
 * Define las formas de pago que los usuarios pueden utilizar
 */
export enum PaymentMethod {
  /**
   * Pago en efectivo al momento de la entrega
   */
  CASH = 'cash',

  /**
   * Pago con tarjeta de crédito/débito
   */
  CARD = 'card',

  /**
   * Transferencia bancaria
   */
  TRANSFER = 'transfer',
}
