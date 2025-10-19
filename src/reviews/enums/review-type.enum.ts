/**
 * ReviewType Enum - Tipos de reseñas disponibles
 * 
 * Define si una reseña es sobre un producto o sobre un vendedor
 */
export enum ReviewType {
  /**
   * Reseña sobre un producto específico
   */
  PRODUCT = 'product',

  /**
   * Reseña sobre un vendedor (usuario)
   */
  SELLER = 'seller',
}
