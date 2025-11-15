/**
 * OrderItemsController
 * 
 * NOTA: Este controller NO se utiliza.
 * Los OrderItems se crean automáticamente al generar órdenes.
 * 
 * Los OrderItems se consultan a través de las relaciones de Order:
 * - GET /orders/:orderId - Retorna la orden con sus items
 * - GET /orders         - Retorna las órdenes del usuario con sus items
 * 
 * Los OrderItems son de solo lectura y no se modifican después de crearse.
 * Representan un snapshot inmutable de los productos al momento de la compra.
 * 
 * Este archivo se mantiene por compatibilidad con la estructura del módulo,
 * pero no se registra en OrderItemsModule.
 */

// Controller deshabilitado - No se usa
// Los OrderItems se crean automáticamente desde OrdersService
