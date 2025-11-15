import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '../cart-item/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Obtener o crear el carrito de un usuario
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  /**
   * Agregar un producto al carrito
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Validar que el producto existe y está disponible
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID "${productId}" no encontrado`);
    }

    if (product.isSold) {
      throw new BadRequestException('Este producto ya está vendido');
    }

    if (!product.isActive) {
      throw new BadRequestException('Este producto no está disponible');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Solo hay ${product.stock} unidades disponibles`,
      );
    }

    // Obtener o crear el carrito
    const cart = await this.getOrCreateCart(userId);

    // Verificar si el producto ya está en el carrito
    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `No se puede agregar. Stock máximo: ${product.stock}`,
        );
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Crear nuevo item
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Retornar carrito actualizado
    return this.getOrCreateCart(userId);
  }

  /**
   * Actualizar cantidad de un item en el carrito
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    if (updateDto.quantity > item.product.stock) {
      throw new BadRequestException(
        `Stock insuficiente. Solo hay ${item.product.stock} unidades disponibles`,
      );
    }

    item.quantity = updateDto.quantity;
    await this.cartItemRepository.save(item);

    return this.getOrCreateCart(userId);
  }

  /**
   * Eliminar un item del carrito
   */
  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    await this.cartItemRepository.remove(item);

    return this.getOrCreateCart(userId);
  }

  /**
   * Vaciar el carrito
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    await this.cartItemRepository.delete({ cartId: cart.id });

    return this.getOrCreateCart(userId);
  }

  /**
   * Obtener el total del carrito
   */
  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getOrCreateCart(userId);

    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }
}
