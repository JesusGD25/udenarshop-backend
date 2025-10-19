/**
 * OrderStatus Enum - Estados de una orden de compra
 * 
 * Define el ciclo de vida de una orden desde su creación hasta la entrega
 */
export enum OrderStatus {
  /**
   * Orden creada, pendiente de pago
   */
  PENDING = 'pending',

  /**
   * Orden pagada exitosamente
   */
  PAID = 'paid',

  /**
   * Orden cancelada (por el comprador o vendedor)
   */
  CANCELLED = 'cancelled',

  /**
   * Orden enviada, en camino al comprador
   */
  SHIPPED = 'shipped',

  /**
   * Orden entregada exitosamente
   */
  DELIVERED = 'delivered',
}
