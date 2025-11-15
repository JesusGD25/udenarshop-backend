import { Injectable } from '@nestjs/common';

/**
 * CartItemService
 * 
 * NOTA: Este servicio NO se utiliza directamente.
 * Los CartItems son manejados internamente por CartService.
 * 
 * Los CartItems son entidades dependientes del Cart y se manipulan
 * a través de los métodos del CartService:
 * - addToCart(): Crea o actualiza CartItems
 * - updateCartItem(): Modifica la cantidad de un CartItem
 * - removeCartItem(): Elimina un CartItem
 * - clearCart(): Elimina todos los CartItems de un carrito
 * 
 * No se exponen endpoints directos para esta entidad.
 */
@Injectable()
export class CartItemService {
  // Este servicio está vacío intencionalmente
  // Toda la lógica está en CartService
}
