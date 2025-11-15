import { Injectable } from '@nestjs/common';

/**
 * OrderItemsService
 * 
 * NOTA: Este servicio NO se utiliza directamente.
 * Los OrderItems son creados automáticamente por OrdersService.
 * 
 * Los OrderItems son entidades que representan un snapshot de los productos
 * en el momento de la compra. Se crean automáticamente cuando:
 * - Se crea una orden desde el carrito (createOrderFromCart)
 * - Preservan el precio, título y vendedor del producto en ese momento
 * 
 * Los OrderItems son de solo lectura una vez creados y se consultan
 * a través de las relaciones de Order.
 * 
 * No se exponen endpoints directos para esta entidad.
 */
@Injectable()
export class OrderItemsService {
  // Este servicio está vacío intencionalmente
  // Los OrderItems se crean automáticamente desde OrdersService
}
