import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Carrito')
@Controller('cart')
@ApiBearerAuth('JWT-auth')
@Roles(Role.USER, Role.ADMIN)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener mi carrito',
    description: 'Obtiene el carrito actual del usuario autenticado con todos sus items',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito obtenido exitosamente',
  })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('add')
  @ApiOperation({
    summary: 'Agregar producto al carrito',
    description: 'Agrega un producto al carrito o incrementa su cantidad si ya existe',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado al carrito',
  })
  @ApiResponse({
    status: 400,
    description: 'Producto no disponible o stock insuficiente',
  })
  addToCart(
    @CurrentUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'Actualizar cantidad de un item',
    description: 'Actualiza la cantidad de un producto en el carrito',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad actualizada',
  })
  updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({
    summary: 'Eliminar item del carrito',
    description: 'Elimina un producto del carrito',
  })
  @ApiResponse({
    status: 200,
    description: 'Item eliminado',
  })
  removeCartItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeCartItem(userId, itemId);
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Vaciar el carrito',
    description: 'Elimina todos los items del carrito',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito vaciado',
  })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Get('total')
  @ApiOperation({
    summary: 'Obtener total del carrito',
    description: 'Calcula el total a pagar del carrito',
  })
  @ApiResponse({
    status: 200,
    description: 'Total calculado',
  })
  getCartTotal(@CurrentUser('id') userId: string) {
    return this.cartService.getCartTotal(userId);
  }
}
