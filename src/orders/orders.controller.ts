import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { OrderStatus } from './enums/order-status.enum';

@ApiTags('Órdenes')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@Roles(Role.USER, Role.ADMIN)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear orden desde el carrito',
    description: 'Crea una nueva orden con todos los productos del carrito',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Carrito vacío o productos no disponibles',
  })
  createOrder(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrderFromCart(userId, createOrderDto);
  }

  @Post(':orderId/pay')
  @ApiOperation({
    summary: 'Procesar pago de una orden',
    description: 'Procesa el pago de una orden pendiente',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago procesado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Pago rechazado o orden ya procesada',
  })
  processPayment(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() paymentDto: ProcessPaymentDto,
  ) {
    return this.ordersService.processOrderPayment(userId, orderId, paymentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener mis órdenes',
    description: 'Obtiene todas las órdenes del usuario autenticado como comprador',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes',
  })
  getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  @Get('sales')
  @ApiOperation({
    summary: 'Obtener mis ventas',
    description: 'Obtiene todas las órdenes donde el usuario es vendedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas',
  })
  getMySales(@CurrentUser('id') userId: string) {
    return this.ordersService.findUserSales(userId);
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Obtener detalles de una orden',
    description: 'Obtiene los detalles completos de una orden',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Patch(':orderId/cancel')
  @ApiOperation({
    summary: 'Cancelar una orden',
    description: 'Cancela una orden pendiente o pagada',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada',
  })
  @ApiResponse({
    status: 400,
    description: 'La orden no se puede cancelar',
  })
  cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.cancelOrder(userId, orderId);
  }

  @Patch(':orderId/status')
  @ApiOperation({
    summary: 'Actualizar estado de orden',
    description: 'Actualiza el estado de una orden (solo para vendedor)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
  })
  updateOrderStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(userId, orderId, status);
  }
}
