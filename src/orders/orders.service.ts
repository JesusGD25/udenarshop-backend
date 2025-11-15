import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentService } from './payment.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Crear orden desde el carrito
   */
  async createOrderFromCart(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    // Obtener carrito con items
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.seller'],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Validar disponibilidad de todos los productos
    for (const item of cart.items) {
      if (item.product.isSold) {
        throw new BadRequestException(
          `El producto "${item.product.title}" ya no está disponible`,
        );
      }
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `Stock insuficiente para "${item.product.title}". Solo hay ${item.product.stock} unidades`,
        );
      }
    }

    // Calcular total
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Crear la orden
    const order = this.orderRepository.create({
      buyerId: userId,
      totalAmount,
      paymentMethod: createOrderDto.paymentMethod,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    await this.orderRepository.save(order);

    // Crear order items
    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productId: cartItem.product.id,
        sellerId: cartItem.product.sellerId,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
        productTitle: cartItem.product.title,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Limpiar el carrito
    await this.cartRepository
      .createQueryBuilder()
      .delete()
      .from('cart_items')
      .where('cartId = :cartId', { cartId: cart.id })
      .execute();

    // Retornar orden con items
    return this.findOne(order.id);
  }

  /**
   * Procesar pago de una orden
   */
  async processOrderPayment(
    userId: string,
    orderId: string,
    paymentDto: ProcessPaymentDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.buyerId !== userId) {
      throw new ForbiddenException('No tienes permiso para pagar esta orden');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `La orden ya fue procesada con estado: ${order.status}`,
      );
    }

    // VALIDACIÓN CRÍTICA: Verificar disponibilidad antes del pago
    // (alguien más pudo haber comprado mientras tanto)
    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(
          `El producto "${item.productTitle}" ya no existe`,
        );
      }

      if (product.isSold) {
        throw new BadRequestException(
          `El producto "${product.title}" ya fue vendido`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `El producto "${product.title}" ya no está disponible`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.title}". Solo hay ${product.stock} unidades disponibles`,
        );
      }
    }

    // Procesar pago con el servicio de pagos
    const paymentResult = await this.paymentService.processPayment(
      order.totalAmount,
      paymentDto,
    );

    if (!paymentResult.success) {
      throw new BadRequestException(paymentResult.message);
    }

    // Actualizar estado de la orden
    order.status = OrderStatus.PAID;
    await this.orderRepository.save(order);

    // Reducir stock y marcar productos como vendidos si es necesario
    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      
      if (!product) {
        throw new BadRequestException(
          `Error al actualizar stock: Producto con ID ${item.productId} no encontrado`,
        );
      }
      
      product.stock -= item.quantity;
      
      if (product.stock === 0) {
        product.isSold = true;
      }
      
      await this.productRepository.save(product);
    }

    return this.findOne(order.id);
  }

  /**
   * Obtener todas las órdenes de un usuario
   */
  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { buyerId: userId },
      relations: ['items', 'items.product', 'items.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener órdenes donde el usuario es vendedor
   */
  async findUserSales(userId: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .where('items.sellerId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Obtener una orden por ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['buyer', 'items', 'items.product', 'items.seller'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  /**
   * Cancelar una orden
   */
  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.buyerId !== userId) {
      throw new ForbiddenException('No tienes permiso para cancelar esta orden');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('No se puede cancelar una orden entregada');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('La orden ya está cancelada');
    }

    // Si la orden ya fue pagada, restaurar stock
    if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED) {
      for (const item of order.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (product) {
          product.stock += item.quantity;
          product.isSold = false;
          await this.productRepository.save(product);
        }
      }
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  /**
   * Actualizar estado de orden (solo para vendedor o admin)
   */
  async updateOrderStatus(
    userId: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    // Verificar que el usuario es vendedor de algún item
    const isSeller = order.items.some((item) => item.sellerId === userId);

    if (!isSeller) {
      throw new ForbiddenException(
        'Solo el vendedor puede actualizar el estado de la orden',
      );
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
