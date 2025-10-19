/**
 * Enum NotificationType - Tipos de notificaciones que puede recibir un usuario
 * 
 * Define los diferentes tipos de eventos que generan notificaciones
 * en el sistema del marketplace.
 */
export enum NotificationType {
  /**
   * Nueva orden recibida - El vendedor recibe notificación de una compra
   */
  NEW_ORDER = 'NEW_ORDER',

  /**
   * Cambio en estado de orden - El comprador recibe actualización de su compra
   */
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',

  /**
   * Nuevo mensaje en chat - Alguien envió un mensaje
   */
  NEW_MESSAGE = 'NEW_MESSAGE',

  /**
   * Nueva reseña recibida - El vendedor recibe una reseña
   */
  NEW_REVIEW = 'NEW_REVIEW',

  /**
   * Producto favorito con cambio de precio - Notificación de bajada de precio
   */
  FAVORITE_PRICE_CHANGE = 'FAVORITE_PRICE_CHANGE',

  /**
   * Producto vendido - El vendedor recibe confirmación de venta
   */
  PRODUCT_SOLD = 'PRODUCT_SOLD',

  /**
   * Producto agregado a favoritos - El vendedor ve interés en su producto
   */
  PRODUCT_FAVORITED = 'PRODUCT_FAVORITED',

  /**
   * Respuesta a reseña - El usuario recibe respuesta del vendedor
   */
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',

  /**
   * Alerta general del sistema - Notificaciones administrativas
   */
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}
